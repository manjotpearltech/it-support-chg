// ztchg-it-cloud-support-w — public AI Search proxy with CORS + streaming + Signed PDF URLs

const AI_SEARCH_NAME = "ztchg-cloud-support-ai-search";

// Exact origins you allow (add/remove as needed)
const ALLOW_EXACT = new Set([
  "https://worker.chargercloud.io",                                         // prod domain
  "https://support.chargercloud.io",                                        // frontend domain
  "https://ztchg-it-cloud-support-w.pearl-technologies-ltd.workers.dev",    // workers.dev test
  "http://localhost:3000",                                                  // local dev (React)
]);

// Also allow any subdomain of chargercloud.io (optional; keep if helpful)
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOW_EXACT.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".chargercloud.io");
  } catch {
    return false;
  }
}

function corsHeaders(origin, extra = {}) {
  // reflect the request origin if allowed; otherwise default to the main site
  const allowOrigin = isAllowedOrigin(origin)
    ? origin
    : "https://worker.chargercloud.io";
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS, GET",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    ...extra,
  };
}

function json(status, data, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

/**
 * Generate a time-limited token for PDF access
 * This is a simple implementation - for production, use crypto.subtle for signing
 */
function generatePDFToken(filename, expiresInSeconds = 1800) {
  const payload = {
    f: filename,                              // filename
    exp: Date.now() + (expiresInSeconds * 1000), // expiration timestamp
    r: Math.random().toString(36).substring(7)    // random nonce
  };
  return btoa(JSON.stringify(payload));
}

/**
 * Validate and decode PDF token
 */
function validatePDFToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    
    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Check required fields
    if (!payload.f) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    return { valid: true, filename: payload.f };
  } catch (err) {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Generate signed URL for PDF
 * This creates a URL pointing to this worker's PDF proxy endpoint
 */
function generateSignedPDFUrl(filename, baseUrl, expiresInSeconds = 1800) {
  const token = generatePDFToken(filename, expiresInSeconds);
  const encodedFilename = encodeURIComponent(filename);
  return `${baseUrl}/api/pdf/${encodedFilename}?token=${token}`;
}

/**
 * Handle PDF proxy requests
 * Serves PDFs from R2 with token validation
 */
async function handlePDFProxy(request, env, origin) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract filename from path: /api/pdf/filename.pdf
  const match = pathname.match(/^\/api\/pdf\/(.+)$/);
  if (!match) {
    return json(400, { error: 'Invalid PDF path' }, origin);
  }
  
  const encodedFilename = match[1];
  const filename = decodeURIComponent(encodedFilename);
  
  // Validate token
  const token = url.searchParams.get('token');
  if (!token) {
    return json(401, { error: 'Missing token' }, origin);
  }
  
  const validation = validatePDFToken(token);
  if (!validation.valid) {
    return json(403, { error: validation.error }, origin);
  }
  
  // Verify filename matches token
  if (validation.filename !== filename) {
    return json(403, { error: 'Token/filename mismatch' }, origin);
  }
  
  // Fetch from R2
  try {
    // TODO: Replace 'YOUR_R2_BUCKET' with your actual R2 bucket binding name
    // You need to add this to wrangler.toml:
    // [[r2_buckets]]
    // binding = "SOP_BUCKET"
    // bucket_name = "your-actual-bucket-name"
    
    const object = await env.SOP_BUCKET.get(filename);
    
    if (!object) {
      return json(404, { error: 'PDF not found' }, origin);
    }
    
    // Return PDF with security headers
    return new Response(object.body, {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // Force inline viewing (no download)
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    return json(500, { 
      error: 'Failed to fetch PDF', 
      detail: err?.message ?? String(err) 
    }, origin);
  }
}

/**
 * Process AI Search results and add signed PDF URLs
 */
function addSignedUrlsToResults(result, baseUrl) {
  // Check if result has data array (source documents)
  if (!result || !result.data || !Array.isArray(result.data)) {
    return result;
  }
  
  // Add signed URL to each source document
  result.data = result.data.map(item => {
    // Assuming each item has a 'filename' field
    // Adjust this based on your actual AI Search response structure
    if (item.filename) {
      return {
        ...item,
        url: generateSignedPDFUrl(item.filename, baseUrl, 1800) // 30 min expiry
      };
    }
    
    // If filename is in metadata or different field, adjust here
    // Example: if it's in item.metadata.source
    if (item.metadata?.source) {
      return {
        ...item,
        filename: item.metadata.source,
        url: generateSignedPDFUrl(item.metadata.source, baseUrl, 1800)
      };
    }
    
    return item;
  });
  
  return result;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || undefined;
    const url = new URL(request.url);
    
    // PDF Proxy endpoint
    if (url.pathname.startsWith('/api/pdf/')) {
      return handlePDFProxy(request, env, origin);
    }

    // Health check
    if (request.method === "GET") {
      return json(
        200,
        { 
          service: "ztchg-it-cloud-support-w", 
          ai_search: AI_SEARCH_NAME, 
          pdf_proxy: "enabled",
          ok: true 
        },
        origin
      );
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json(
        405,
        { error: "Use POST with JSON: { query, filters?, max_num_results?, stream? }" },
        origin
      );
    }

    // Parse JSON body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: "Invalid JSON body" }, origin);
    }

    const {
      query,
      filters,
      max_num_results,
      rewrite_query = true,
      stream = false,
    } = body ?? {};

    if (!query || typeof query !== "string") {
      return json(400, { error: "Field 'query' (string) is required" }, origin);
    }

    try {
      const args = {
        query,
        filters,
        max_num_results: Number.isFinite(max_num_results) ? max_num_results : 10,
        rewrite_query,
        reranking: { enabled: true },
        stream,
      };

      const result = await env.AI.autorag(AI_SEARCH_NAME).aiSearch(args);

      if (stream) {
        // For streaming, we need to parse the stream and add URLs
        // This is more complex - for now, recommend using non-streaming for PDF URLs
        return new Response(result, {
          headers: corsHeaders(origin, { "content-type": "text/event-stream" }),
        });
      }

      // Add signed URLs to the result
      const baseUrl = `https://${url.hostname}`;
      const resultWithUrls = addSignedUrlsToResults(result, baseUrl);

      return new Response(JSON.stringify(resultWithUrls), {
        headers: corsHeaders(origin, { "content-type": "application/json" }),
      });
    } catch (err) {
      return json(
        502,
        { error: "AI Search call failed", detail: err?.message ?? String(err) },
        origin
      );
    }
  },
};

