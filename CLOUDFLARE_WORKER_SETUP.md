# Cloudflare Worker Setup Guide

This guide will help you deploy your IT Support Cloudflare Worker and connect it to your React frontend.

## 🎯 Architecture

```
React Frontend (Cloudflare Pages)
        ↓
Cloudflare Worker (Serverless API)
        ↓
Azure OpenAI (GPT-4o-mini)
```

**Benefits:**
- ✅ No backend server to manage
- ✅ API keys never exposed to browser
- ✅ Auto-scaling and global CDN
- ✅ Free tier: 100,000 requests/day
- ✅ Fast response times (<50ms)

---

## 📋 Prerequisites

1. **Cloudflare Account** (free tier is fine)
   - Sign up at https://dash.cloudflare.com/sign-up

2. **Node.js installed** (v16 or higher)
   - Check: `node --version`

3. **Azure OpenAI credentials** (you already have these)
   - Endpoint
   - API Key
   - Deployment name
   - API Version

---

## 🚀 Step 1: Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing Workers.

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

---

## 🔐 Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

---

## 📦 Step 3: Deploy the Worker

From your project root directory:

```bash
npx wrangler deploy
```

This will:
- Upload your worker code to Cloudflare
- Give you a worker URL like: `https://it-support-worker.YOUR-SUBDOMAIN.workers.dev`

**Save this URL!** You'll need it for the frontend.

---

## 🔑 Step 4: Add Secrets to Cloudflare

Secrets are encrypted environment variables that your worker can access.

### Add Azure OpenAI Endpoint
```bash
npx wrangler secret put AZURE_OPENAI_ENDPOINT
```
When prompted, paste: `https://manjo-mgzmovnn-eastus2.openai.azure.com/`

### Add Azure OpenAI API Key
```bash
npx wrangler secret put AZURE_OPENAI_API_KEY
```
When prompted, paste your API key from Azure Portal

### Add Azure OpenAI Deployment
```bash
npx wrangler secret put AZURE_OPENAI_DEPLOYMENT
```
When prompted, paste: `azcaitsupportopenai-gpt-4o-mini`

### Add Azure OpenAI API Version
```bash
npx wrangler secret put AZURE_OPENAI_API_VERSION
```
When prompted, paste: `2024-02-15-preview`

---

## ✅ Step 5: Test the Worker

### Test Health Check
```bash
curl https://it-support-worker.YOUR-SUBDOMAIN.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "service": "IT Support Cloudflare Worker"
}
```

### Test Chat Endpoint
```bash
curl -X POST https://it-support-worker.YOUR-SUBDOMAIN.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I reset my password?"}'
```

Expected response:
```json
{
  "response": "To reset your password...",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

---

## 🎨 Step 6: Update React Frontend

### 6.1 Update .env file

Add your worker URL to `.env`:

```env
# Cloudflare Worker URL (from Step 3)
REACT_APP_WORKER_URL=https://it-support-worker.YOUR-SUBDOMAIN.workers.dev

# Remove these - no longer needed in frontend
# REACT_APP_AZURE_OPENAI_ENDPOINT=
# REACT_APP_AZURE_OPENAI_API_KEY=
# REACT_APP_AZURE_OPENAI_DEPLOYMENT=
# REACT_APP_AZURE_OPENAI_API_VERSION=
```

### 6.2 Test Locally

```bash
npm start
```

Open http://localhost:3000 and test the chat!

---

## 🌐 Step 7: Deploy Frontend to Cloudflare Pages

### 7.1 Add Environment Variable in Cloudflare Pages

1. Go to **Cloudflare Dashboard** → **Pages**
2. Select your project
3. Go to **Settings** → **Environment variables**
4. Add variable:
   - **Name:** `REACT_APP_WORKER_URL`
   - **Value:** `https://it-support-worker.YOUR-SUBDOMAIN.workers.dev`
5. Click **Save**

### 7.2 Redeploy

Push to GitHub or click **Retry deployment** in Cloudflare Pages.

---

## 🔒 Step 8: Secure Your Worker (Production)

### Update CORS Settings

Edit `worker/index.js` and change:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // ❌ Allow all (development)
  // ...
};
```

To:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-app.pages.dev', // ✅ Your domain only
  // ...
};
```

Then redeploy:
```bash
npx wrangler deploy
```

---

## 📊 Step 9: Monitor Your Worker

### View Logs
```bash
npx wrangler tail
```

This shows real-time logs from your worker.

### View Analytics

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click your worker
3. Click **Metrics** tab

You'll see:
- Request count
- Error rate
- CPU time
- Response time

---

## 🎫 Step 10: (Optional) Add Ticketing System

The worker has a mock ticket creation endpoint. To connect a real ticketing system:

1. Edit `worker/index.js`
2. Find the `createTicket` function
3. Replace with your ticketing API (Zendesk, Freshdesk, etc.)

Example for Zendesk:
```javascript
async function createTicket(subject, description, userName, userEmail, env) {
  const response = await fetch('https://yourcompany.zendesk.com/api/v2/tickets.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(env.ZENDESK_EMAIL + '/token:' + env.ZENDESK_API_TOKEN)}`,
    },
    body: JSON.stringify({
      ticket: {
        subject: subject,
        comment: { body: description },
        requester: { name: userName, email: userEmail },
      },
    }),
  });
  
  const data = await response.json();
  return {
    success: true,
    ticketId: data.ticket.id,
    ticketUrl: data.ticket.url,
    message: 'Ticket created successfully!',
  };
}
```

---

## 🐛 Troubleshooting

### Worker returns 500 error
- Check secrets are set: `npx wrangler secret list`
- View logs: `npx wrangler tail`
- Verify Azure credentials are correct

### CORS errors in browser
- Make sure CORS headers are set correctly
- Check worker URL in `.env` is correct
- Try hard refresh: `Cmd+Shift+R`

### "Worker not found"
- Redeploy: `npx wrangler deploy`
- Check worker name in `wrangler.toml`

### Azure OpenAI errors
- Verify API key is valid
- Check deployment name is correct
- Ensure endpoint URL is correct

---

## 💰 Pricing

**Cloudflare Workers Free Tier:**
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ Unlimited bandwidth

**Paid Plan ($5/month):**
- 10 million requests/month included
- $0.50 per additional million

**Azure OpenAI Costs:**
- GPT-4o-mini: ~$0.15 per 1M input tokens
- Your usage will be minimal for IT support

---

## 📚 Useful Commands

```bash
# Deploy worker
npx wrangler deploy

# View logs
npx wrangler tail

# List secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete SECRET_NAME

# Test locally (with secrets)
npx wrangler dev

# View worker info
npx wrangler whoami
```

---

## 🎉 You're Done!

Your IT Support app is now running on:
- ✅ **Frontend:** Cloudflare Pages (React)
- ✅ **Backend:** Cloudflare Workers (Serverless)
- ✅ **AI:** Azure OpenAI (GPT-4o-mini)

**All serverless, all secure, all fast!** 🚀

---

## 📞 Support

If you run into issues:
1. Check the troubleshooting section above
2. View worker logs: `npx wrangler tail`
3. Check Cloudflare dashboard for errors
4. Review Azure OpenAI quotas and limits

---

## 🔗 Useful Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Azure OpenAI Docs](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

