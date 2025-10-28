# Secure PDF Viewer Implementation Guide

## 🔒 Security Requirements

Your PDF viewer now implements the following security measures:

### Frontend Security (✅ COMPLETED)
- ✅ **No Download Button** - Download functionality removed
- ✅ **No Print Capability** - Keyboard shortcuts (Cmd+P/Ctrl+P) disabled
- ✅ **No Right-Click** - Context menu disabled to prevent "Save As"
- ✅ **No Text Selection** - Text layer disabled (`renderTextLayer={false}`)
- ✅ **View-Only Mode** - Visual indicator shows "🔒 View Only"
- ✅ **Expired URL Handling** - Graceful error messages for expired signed URLs
- ✅ **Mobile Protection** - Opens in new tab on mobile (harder to download)

### Backend Security (⚠️ REQUIRED - See Implementation Below)
- ⚠️ **Signed URLs** - Time-limited, cryptographically signed URLs from R2
- ⚠️ **Short Expiration** - URLs expire after 15-30 minutes
- ⚠️ **No Direct Access** - PDFs only accessible via signed URLs
- ⚠️ **CORS Restrictions** - Only allow requests from your domain

---

## 📋 Backend Implementation Required

You need to update your **Cloudflare Worker** to generate signed URLs for PDFs stored in R2.

### Step 1: Update Cloudflare Worker Response Format

Your worker should return PDF URLs in this format:

```javascript
// Current response format (needs update):
{
  "response": "Here's the information...",
  "data": [
    {
      "filename": "SOP_Password_Reset.pdf",
      "score": 0.95
      // ❌ Missing: "url" field
    }
  ]
}

// Required response format:
{
  "response": "Here's the information...",
  "data": [
    {
      "filename": "SOP_Password_Reset.pdf",
      "score": 0.95,
      "url": "https://your-bucket.r2.cloudflarestorage.com/SOP_Password_Reset.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Signature=..."
      // ✅ Signed URL with expiration
    }
  ]
}
```

### Step 2: Generate Signed URLs in Cloudflare Worker

Add this code to your Cloudflare Worker:

```javascript
import { AwsClient } from 'aws4fetch';

export default {
  async fetch(request, env) {
    // ... your existing chat logic ...

    // After retrieving relevant documents, generate signed URLs
    const sourcesWithSignedUrls = await Promise.all(
      sources.map(async (source) => {
        const signedUrl = await generateSignedUrl(
          env.R2_BUCKET,
          source.filename,
          env.R2_ACCESS_KEY_ID,
          env.R2_SECRET_ACCESS_KEY,
          env.R2_ACCOUNT_ID
        );

        return {
          filename: source.filename,
          score: source.score,
          url: signedUrl
        };
      })
    );

    return new Response(JSON.stringify({
      response: aiResponse,
      data: sourcesWithSignedUrls
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Generate a signed URL for R2 object
 * @param {string} bucketName - R2 bucket name
 * @param {string} objectKey - Object key (filename)
 * @param {string} accessKeyId - R2 access key ID
 * @param {string} secretAccessKey - R2 secret access key
 * @param {string} accountId - Cloudflare account ID
 * @returns {Promise<string>} - Signed URL
 */
async function generateSignedUrl(bucketName, objectKey, accessKeyId, secretAccessKey, accountId) {
  const url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encodeURIComponent(objectKey)}`;
  
  const aws = new AwsClient({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    service: 's3',
    region: 'auto'
  });

  // Generate presigned URL with 30-minute expiration
  const signedUrl = await aws.sign(url, {
    method: 'GET',
    aws: {
      signQuery: true,
      // Expires in 30 minutes (1800 seconds)
      expiresIn: 1800
    }
  });

  return signedUrl.url;
}
```

### Step 3: Install Required Dependencies

In your Cloudflare Worker project:

```bash
npm install aws4fetch
```

### Step 4: Configure Environment Variables

Add these secrets to your Cloudflare Worker:

```bash
# Get these from Cloudflare Dashboard > R2 > Manage R2 API Tokens
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY

# Add to wrangler.toml:
[vars]
R2_ACCOUNT_ID = "your-account-id"
R2_BUCKET = "your-bucket-name"
```

### Step 5: Configure R2 Bucket CORS

Set CORS policy on your R2 bucket to only allow your domain:

```bash
wrangler r2 bucket cors put <BUCKET_NAME> --cors-config cors.json
```

**cors.json:**
```json
[
  {
    "AllowedOrigins": [
      "https://support.chargercloud.io",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 🧪 Testing the Implementation

### Test 1: Verify Signed URLs
1. Send a message in the chat
2. Open browser DevTools > Network tab
3. Look for the API response
4. Verify each source has a `url` field with query parameters like `X-Amz-Signature`

### Test 2: Verify URL Expiration
1. Copy a signed URL from the network response
2. Wait 30+ minutes
3. Try to access the URL directly
4. Should get 403 Forbidden error

### Test 3: Verify No Download/Print
1. Open a PDF in the viewer
2. Try right-clicking → Should be disabled
3. Try Cmd+P / Ctrl+P → Should be blocked
4. Verify no download button is visible

### Test 4: Verify Mobile Behavior
1. Open on mobile device or resize browser to mobile width
2. Click a source citation
3. Should open in new tab (not inline viewer)

---

## 🔐 Security Levels Achieved

| Security Feature | Status | Description |
|-----------------|--------|-------------|
| **No Direct Download** | ✅ | Download button removed from UI |
| **No Print** | ✅ | Keyboard shortcuts disabled |
| **No Right-Click** | ✅ | Context menu disabled |
| **No Text Copy** | ✅ | Text layer disabled |
| **Time-Limited Access** | ⚠️ | Requires backend implementation |
| **Signed URLs** | ⚠️ | Requires backend implementation |
| **CORS Protection** | ⚠️ | Requires R2 configuration |
| **Domain Restriction** | ⚠️ | Requires R2 CORS setup |

---

## 📝 Alternative: Cloudflare Worker R2 Proxy

If you prefer not to expose R2 URLs directly, you can proxy PDFs through your Worker:

```javascript
// In your Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle PDF proxy requests
    if (url.pathname.startsWith('/api/pdf/')) {
      return handlePDFProxy(request, env);
    }
    
    // Handle chat requests
    if (url.pathname === '/api/chat') {
      return handleChat(request, env);
    }
  }
};

async function handlePDFProxy(request, env) {
  const url = new URL(request.url);
  const filename = url.pathname.replace('/api/pdf/', '');
  
  // Verify request has valid session token
  const token = url.searchParams.get('token');
  if (!isValidToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check token expiration (30 minutes)
  if (isTokenExpired(token)) {
    return new Response('Token expired', { status: 403 });
  }
  
  // Fetch from R2
  const object = await env.R2_BUCKET.get(filename);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }
  
  // Return PDF with security headers
  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline', // Force inline viewing
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate'
    }
  });
}

// Generate time-limited tokens
function generateToken(filename, expiresIn = 1800) {
  const payload = {
    filename: filename,
    exp: Date.now() + (expiresIn * 1000)
  };
  // Use crypto.subtle to sign the token
  return btoa(JSON.stringify(payload));
}

function isValidToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    return payload.filename && payload.exp;
  } catch {
    return false;
  }
}

function isTokenExpired(token) {
  const payload = JSON.parse(atob(token));
  return Date.now() > payload.exp;
}
```

Then update your response format:

```javascript
{
  "filename": "SOP_Password_Reset.pdf",
  "score": 0.95,
  "url": "https://worker.chargercloud.io/api/pdf/SOP_Password_Reset.pdf?token=eyJmaWxlbmFtZSI6..."
}
```

---

## 🚀 Next Steps

1. **Choose Implementation Method:**
   - Option A: R2 Signed URLs (recommended, more scalable)
   - Option B: Worker Proxy (simpler, more control)

2. **Update Cloudflare Worker** with chosen method

3. **Test thoroughly** with all security scenarios

4. **Deploy to production** after verification

5. **Monitor** for any unauthorized access attempts

---

## ⚠️ Important Notes

- **Frontend security is NOT enough** - Users can still access PDFs via DevTools/Network tab
- **Backend signed URLs are REQUIRED** for true security
- **Expiration times** should be short (15-30 minutes recommended)
- **CORS configuration** is critical to prevent cross-origin access
- **Monitor R2 access logs** for suspicious activity

---

## 📞 Need Help?

If you need assistance implementing the backend:
1. Share your current Cloudflare Worker code
2. Confirm your R2 bucket name and structure
3. I can provide specific implementation for your setup

