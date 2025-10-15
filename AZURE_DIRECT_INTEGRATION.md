# Azure Direct Integration Guide

## Overview

The React app now calls Azure OpenAI directly from the frontend, eliminating the need for a backend server in production. This simplifies deployment and reduces infrastructure costs.

## How It Works

### Architecture
```
React App (Frontend)
    ↓
Azure OpenAI REST API (Direct)
    ↓
Response
```

### No Backend Server Needed
- ✅ React app calls Azure OpenAI directly
- ✅ No backend server required in production
- ✅ Simplified deployment to Cloudflare Pages
- ✅ Reduced infrastructure costs
- ✅ Faster response times

## Setup Instructions

### 1. Get Azure Credentials

You need:
- **Azure OpenAI Endpoint**: `https://your-service.openai.azure.com`
- **Azure OpenAI API Key**: Your API key
- **Deployment Name**: Usually `gpt-4o-mini` or similar

### 2. Create `.env` File

Create a `.env` file in the root directory:

```
REACT_APP_AZURE_OPENAI_ENDPOINT=https://your-service.openai.azure.com
REACT_APP_AZURE_OPENAI_KEY=your-api-key
REACT_APP_AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

**Important**: These variables must start with `REACT_APP_` to be exposed to the frontend.

### 3. For Cloudflare Pages

Set environment variables in Cloudflare Pages dashboard:

1. Go to your project settings
2. Navigate to "Environment variables"
3. Add the following variables:
   - `REACT_APP_AZURE_OPENAI_ENDPOINT`
   - `REACT_APP_AZURE_OPENAI_KEY`
   - `REACT_APP_AZURE_OPENAI_DEPLOYMENT`

### 4. Deploy

```bash
git add -A
git commit -m "Add Azure credentials"
git push origin main
```

Cloudflare Pages will automatically build and deploy.

## Security Considerations

### API Key Exposure
⚠️ **Warning**: The API key is exposed in the frontend code. This is a security risk.

### Mitigation Options

#### Option 1: Use Read-Only Keys (Recommended)
- Create a read-only API key in Azure
- This key can only call the chat endpoint
- Limits damage if key is compromised

#### Option 2: Use Backend Proxy (More Secure)
- Keep the backend server running
- Backend calls Azure with the API key
- Frontend calls backend (no key exposure)
- See `server/index.js` for implementation

#### Option 3: Use Azure AD Authentication
- Implement Azure AD authentication
- Users authenticate with their Azure credentials
- More complex but more secure

## API Endpoint

The app calls Azure OpenAI REST API:

```
POST {endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-08-01-preview
```

Headers:
```
Content-Type: application/json
api-key: {your-api-key}
```

Body:
```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "max_tokens": 700,
  "temperature": 0.2
}
```

## Fallback to Backend

If Azure credentials are not configured, the app falls back to the backend API:

```
React App
    ↓
Try Azure OpenAI (if credentials available)
    ↓ (if fails)
Fallback to Backend API (/api/chat)
    ↓
Backend Server
    ↓
Azure OpenAI
```

This allows:
- ✅ Production deployment without backend
- ✅ Local development with mock mode
- ✅ Graceful fallback if Azure is unavailable

## Local Development

### With Azure Credentials

1. Create `.env` file with Azure credentials
2. Run: `npm start`
3. App calls Azure directly

### Without Azure Credentials (Mock Mode)

1. Run: `npm run dev`
2. Backend server starts with mock mode
3. App falls back to backend API
4. Mock responses are returned

## Troubleshooting

### Error: "Azure OpenAI credentials not configured"
- Check `.env` file exists
- Verify `REACT_APP_AZURE_OPENAI_ENDPOINT` is set
- Verify `REACT_APP_AZURE_OPENAI_KEY` is set
- Restart the app

### Error: "Azure API error: 401"
- Check API key is correct
- Verify endpoint is correct
- Check key hasn't expired

### Error: "Azure API error: 404"
- Check deployment name is correct
- Verify deployment exists in Azure
- Check API version is correct

### App Falls Back to Backend
- Azure credentials not configured
- Check `.env` file
- Check environment variables in Cloudflare Pages
- Check browser console for errors

## Environment Variables

### Frontend (React App)
```
REACT_APP_AZURE_OPENAI_ENDPOINT
REACT_APP_AZURE_OPENAI_KEY
REACT_APP_AZURE_OPENAI_DEPLOYMENT
```

### Backend (Node.js Server)
```
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_KEY
AZURE_OPENAI_DEPLOYMENT
AZURE_SEARCH_ENDPOINT
AZURE_SEARCH_KEY
AZURE_SEARCH_INDEX
```

## Cost Considerations

### Direct Integration
- Only pay for API calls
- No server infrastructure costs
- Faster response times
- Simpler deployment

### Backend Integration
- Pay for API calls
- Pay for server infrastructure
- Slower response times (extra hop)
- More complex deployment

## Performance

### Direct Integration
- Latency: ~500-1000ms (Azure response time)
- No backend overhead
- Direct connection to Azure

### Backend Integration
- Latency: ~800-1500ms (backend + Azure)
- Backend processing overhead
- Extra network hop

## Deployment Checklist

- [ ] Azure OpenAI service created
- [ ] API key generated
- [ ] Endpoint URL obtained
- [ ] Deployment name verified
- [ ] `.env` file created locally
- [ ] Environment variables set in Cloudflare Pages
- [ ] Build successful (`npm run build`)
- [ ] App tested locally
- [ ] Changes committed to git
- [ ] Changes pushed to GitHub
- [ ] Cloudflare Pages deployment successful
- [ ] App tested in production

## Next Steps

1. **Get Azure Credentials**: Create Azure OpenAI service
2. **Create `.env` File**: Add credentials locally
3. **Test Locally**: Run `npm start` and test chat
4. **Deploy**: Push to GitHub and deploy to Cloudflare Pages
5. **Set Environment Variables**: Configure in Cloudflare Pages dashboard
6. **Test Production**: Verify chat works on deployed app

## Support

For issues:
1. Check browser console for errors
2. Check Cloudflare Pages build logs
3. Verify Azure credentials are correct
4. Check Azure OpenAI service is running
5. Verify API key has correct permissions

## References

- [Azure OpenAI REST API](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/)
- [Azure OpenAI Deployment](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource)

