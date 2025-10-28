// ztchg-it-cloud-support-w — AI Search proxy with Secure PDF URLs
// Updated to include R2 PDF proxy with time-limited tokens

const AI_SEARCH_NAME = "ztchg-cloud-support-ai-search";

// Allowed origins
const ALLOW_EXACT = new Set([
  "https://worker.chargercloud.io",
  "https://support.chargercloud.io",
  "https://ztchg-it-cloud-support-w.pearl-technologies-ltd.workers.dev",
  "http://localhost:3000",
]);

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
 * Generate time-limited token for PDF access
 */
function generatePDFToken(filename, expiresInSeconds = 1800) {
  const payload = {
    f: filename,
    exp: Date.now() + (expiresInSeconds * 1000),
    r: Math.random().toString(36).substring(7)
  };
  return btoa(JSON.stringify(payload));
}

/**
 * Validate PDF token
 */
function validatePDFToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    if (!payload.f) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: true, filename: payload.f };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Generate signed PDF URL
 */
function generateSignedPDFUrl(filename, baseUrl, expiresInSeconds = 1800) {
  const token = generatePDFToken(filename, expiresInSeconds);
  const encodedFilename = encodeURIComponent(filename);
  return `${baseUrl}/api/pdf/${encodedFilename}?token=${token}`;
}

/**
 * Handle PDF proxy requests - serves PDFs from R2 with token validation
 */
async function handlePDFProxy(request, env, origin) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract filename: /api/pdf/filename.pdf
  const match = pathname.match(/^\/api\/pdf\/(.+)$/);
  if (!match) {
    return json(400, { error: 'Invalid PDF path' }, origin);
  }
  
  const filename = decodeURIComponent(match[1]);
  
  // Validate token
  const token = url.searchParams.get('token');
  if (!token) {
    return json(401, { error: 'Missing authentication token' }, origin);
  }
  
  const validation = validatePDFToken(token);
  if (!validation.valid) {
    return json(403, { error: validation.error }, origin);
  }
  
  // Verify filename matches token
  if (validation.filename !== filename) {
    return json(403, { error: 'Invalid token for this file' }, origin);
  }
  
  // Fetch from R2
  try {
    const object = await env.R2_BUCKET.get(filename);
    
    if (!object) {
      return json(404, { error: 'PDF not found' }, origin);
    }
    
    // Return PDF with security headers (no download, no cache)
    return new Response(object.body, {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error('R2 fetch error:', err);
    return json(500, { 
      error: 'Failed to fetch PDF', 
      detail: err?.message ?? String(err) 
    }, origin);
  }
}

/**
 * Extract filename from AI Search result item
 * Handles multiple possible field locations
 */
function extractFilename(item) {
  // Try common field names
  if (item.filename) return item.filename;
  if (item.source) return item.source;
  if (item.metadata?.source) return item.metadata.source;
  if (item.metadata?.filename) return item.metadata.filename;
  if (item.document?.filename) return item.document.filename;
  
  // If none found, return null
  return null;
}

/**
 * Add signed URLs to AI Search results
 */
function addSignedUrlsToResults(result, baseUrl) {
  if (!result || !result.data || !Array.isArray(result.data)) {
    return result;
  }
  
  result.data = result.data.map(item => {
    const filename = extractFilename(item);
    
    if (filename) {
      return {
        ...item,
        filename: filename, // Ensure filename is at top level
        url: generateSignedPDFUrl(filename, baseUrl, 1800) // 30 min expiry
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
      return json(200, { 
        service: "ztchg-it-cloud-support-w", 
        ai_search: AI_SEARCH_NAME,
        pdf_proxy: "enabled",
        r2_bucket: "ztchg-it-cloud-support",
        ok: true 
      }, origin);
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json(405, { 
        error: "Use POST with JSON: { query, filters?, max_num_results?, stream? }" 
      }, origin);
    }

    // Parse JSON body
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
        // Streaming mode - return as-is
        // Note: Signed URLs won't be added in streaming mode
        return new Response(result, {
          headers: corsHeaders(origin, { "content-type": "text/event-stream" }),
        });
      }

      // Add signed URLs to non-streaming results
      const baseUrl = `https://${url.hostname}`;
      const resultWithUrls = addSignedUrlsToResults(result, baseUrl);

      return new Response(JSON.stringify(resultWithUrls), {
        headers: corsHeaders(origin, { "content-type": "application/json" }),
      });
    } catch (err) {
      console.error('AI Search error:', err);
      return json(502, { 
        error: "AI Search call failed", 
        detail: err?.message ?? String(err) 
      }, origin);
    }
  },
};

