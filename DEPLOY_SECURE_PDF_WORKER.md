# Deploy Secure PDF Worker - Step by Step Guide

## 📋 Overview

This guide will help you update your Cloudflare Worker to serve PDFs securely with time-limited access.

---

## 🔧 Step 1: Update wrangler.toml

Add R2 bucket binding to your `wrangler.toml`:

```toml
name = "ztchg-it-cloud-support-w"
main = "src/index.js"
compatibility_date = "2024-01-01"

# Add this R2 bucket binding
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ztchg-it-cloud-support"
```

**Important:** The `binding` name must be `R2_BUCKET` (this is what the worker code uses).

---

## 📝 Step 2: Replace Worker Code

Replace your current worker code with the contents of `UPDATED_WORKER.js`.

**File location:** Usually `src/index.js` or `worker.js` in your worker project.

---

## 🧪 Step 3: Test Locally (Optional)

If you have wrangler installed:

```bash
# Install dependencies (if needed)
npm install

# Test locally
npx wrangler dev

# Test the health endpoint
curl http://localhost:8787/

# Test a query
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I reset my password?", "stream": false}'
```

---

## 🚀 Step 4: Deploy to Cloudflare

```bash
# Deploy the worker
npx wrangler deploy

# Or if you don't have wrangler locally, use the Cloudflare Dashboard:
# 1. Go to Workers & Pages
# 2. Click your worker: ztchg-it-cloud-support-w
# 3. Click "Quick Edit"
# 4. Paste the UPDATED_WORKER.js code
# 5. Click "Save and Deploy"
```

---

## ✅ Step 5: Verify Deployment

### Test 1: Health Check
```bash
curl https://worker.chargercloud.io/
```

Expected response:
```json
{
  "service": "ztchg-it-cloud-support-w",
  "ai_search": "ztchg-cloud-support-ai-search",
  "pdf_proxy": "enabled",
  "r2_bucket": "ztchg-it-cloud-support",
  "ok": true
}
```

### Test 2: Query with PDF URLs
```bash
curl -X POST https://worker.chargercloud.io/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "query": "How do I connect to WiFi?",
    "max_num_results": 3,
    "stream": false
  }'
```

Expected response should include `url` field:
```json
{
  "response": "To connect to WiFi...",
  "data": [
    {
      "filename": "Connect to OLI BYOD WIFI.pdf",
      "score": 0.95,
      "url": "https://worker.chargercloud.io/api/pdf/Connect%20to%20OLI%20BYOD%20WIFI.pdf?token=eyJmIjoiQ29..."
    }
  ]
}
```

### Test 3: PDF Access
Copy a URL from the response above and test it:
```bash
curl "https://worker.chargercloud.io/api/pdf/Connect%20to%20OLI%20BYOD%20WIFI.pdf?token=..." \
  -H "Origin: http://localhost:3000" \
  --output test.pdf
```

Should download the PDF file.

---

## 🎯 Step 6: Test in Your Frontend

1. **Open your app:** http://localhost:3000
2. **Send a message:** "How do I reset my password?"
3. **Check the response:** Open DevTools > Network > Find the API call
4. **Verify URL field:** Each source should have a `url` field
5. **Click a source:** PDF should open in the side panel!

---

## 🔍 Troubleshooting

### Issue: "R2_BUCKET is not defined"

**Solution:** Make sure you added the R2 binding to `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ztchg-it-cloud-support"
```

Then redeploy:
```bash
npx wrangler deploy
```

### Issue: "PDF not found" (404)

**Possible causes:**
1. Filename mismatch (check exact filename in R2 bucket)
2. Filename encoding issue (spaces, special characters)

**Debug:**
```javascript
// Add console.log to worker to see what filename is being requested
console.log('Requesting PDF:', filename);
```

### Issue: "Token expired" (403)

**Cause:** Token is valid for 30 minutes. After that, user needs to send a new message.

**Solution:** This is expected behavior for security. User should:
1. Send a new message to get fresh URLs
2. Click the source again

### Issue: No `url` field in response

**Possible causes:**
1. AI Search response structure is different than expected
2. Filename field is in a different location

**Debug:** Add logging to see the actual response:
```javascript
// In the worker, before addSignedUrlsToResults:
console.log('AI Search result:', JSON.stringify(result, null, 2));
```

Then check the logs:
```bash
npx wrangler tail
```

---

## 📊 What Changed

### Before (Old Worker):
```json
{
  "response": "...",
  "data": [
    {
      "filename": "SOP.pdf",
      "score": 0.95
      // ❌ No URL field
    }
  ]
}
```

### After (New Worker):
```json
{
  "response": "...",
  "data": [
    {
      "filename": "SOP.pdf",
      "score": 0.95,
      "url": "https://worker.chargercloud.io/api/pdf/SOP.pdf?token=eyJ..."
      // ✅ Signed URL added
    }
  ]
}
```

---

## 🔐 Security Features

| Feature | Implementation | Expiry |
|---------|---------------|--------|
| **Time-Limited URLs** | Token expires after 30 minutes | ✅ |
| **Token Validation** | Cryptographic token verification | ✅ |
| **Filename Binding** | Token tied to specific file | ✅ |
| **No Direct R2 Access** | All access through worker proxy | ✅ |
| **CORS Protection** | Only allowed origins can access | ✅ |
| **No Download Header** | `Content-Disposition: inline` | ✅ |
| **No Cache** | `Cache-Control: no-store` | ✅ |

---

## 📞 Need Help?

If you encounter issues:

1. **Check worker logs:**
   ```bash
   npx wrangler tail
   ```

2. **Test the API response structure:**
   - See `TEST_API_RESPONSE.md` for instructions
   - Share the response structure so I can adjust the code

3. **Verify R2 bucket:**
   - Bucket name: `ztchg-it-cloud-support`
   - Files are in root (no subfolder)
   - Filenames match exactly (case-sensitive)

---

## ✅ Success Checklist

- [ ] Updated `wrangler.toml` with R2 binding
- [ ] Replaced worker code with `UPDATED_WORKER.js`
- [ ] Deployed to Cloudflare
- [ ] Health check returns `"pdf_proxy": "enabled"`
- [ ] API response includes `url` field in each source
- [ ] PDF opens in frontend when clicking source
- [ ] Token expires after 30 minutes (security working)

---

Once deployed, your PDF viewer will be fully functional with secure, time-limited access! 🎉

