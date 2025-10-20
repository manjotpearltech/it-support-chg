# Azure OpenAI RAG Integration - Setup Guide

## Overview

This application now integrates with **Azure OpenAI** using **Retrieval Augmented Generation (RAG)** with **Azure Search** for knowledge base grounding.

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                                                             │
│  - No Azure credentials exposed                            │
│  - Communicates only with backend API                      │
│  - Secure and safe for public deployment                  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                        │
│                                                             │
│  - Stores all Azure credentials securely                   │
│  - Handles authentication with Azure services              │
│  - Implements RAG with Azure Search                        │
│  - Returns only processed responses to frontend            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Secure)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure OpenAI + Azure Search                    │
│                                                             │
│  - Credentials never exposed to frontend                   │
│  - RAG grounding with knowledge base                       │
│  - Semantic search for relevant documents                  │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your Azure credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Azure credentials:

```env
# Backend - Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://manjo-mgzmovnn-eastus2.openai.azure.com/
AZURE_OPENAI_KEY=your-actual-api-key
AZURE_OPENAI_DEPLOYMENT=azcaitsupportopenai-gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Backend - Azure Search Configuration
AZURE_SEARCH_ENDPOINT=https://azcaitsupportazuresearch.search.windows.net
AZURE_SEARCH_KEY=your-actual-search-key
AZURE_SEARCH_INDEX=azureblob-index

# Frontend - Backend URL
REACT_APP_BACKEND_URL=http://localhost:5001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

**Development Mode (with backend):**
```bash
npm run dev
```

This starts both the backend server (port 5001) and React app (port 3000).

**Production Mode:**
```bash
npm run build
npm run server
```

## Security Best Practices

### ✅ DO

- ✅ Keep `.env` file in `.gitignore` (already configured)
- ✅ Use environment variables for all credentials
- ✅ Use the backend proxy pattern (credentials on server only)
- ✅ Rotate API keys regularly
- ✅ Use read-only keys where possible
- ✅ Monitor Azure usage and costs
- ✅ Enable Azure AD authentication for additional security

### ❌ DON'T

- ❌ Commit `.env` file to Git
- ❌ Expose API keys in frontend code
- ❌ Use hardcoded credentials
- ❌ Share credentials in chat or email
- ❌ Use production keys in development
- ❌ Log sensitive information

## API Endpoints

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "message": "Your question here",
  "conversationHistory": [],
  "userName": "Optional",
  "userEmail": "Optional"
}
```

### Health Check
```
GET /api/health
```

### Ticket Creation
```
POST /api/ticket
Content-Type: application/json

{
  "subject": "Issue title",
  "description": "Issue description",
  "userName": "User name",
  "userEmail": "user@company.com"
}
```

## Troubleshooting

### Backend won't start
1. Check `.env` file exists and has correct credentials
2. Verify Azure services are accessible
3. Check port 5001 is not in use
4. Review server logs for errors

### Chat not working
1. Verify backend is running: `curl http://localhost:5001/api/health`
2. Check browser console for errors
3. Verify Azure credentials in `.env`
4. Check Azure service status

### Search results not appearing
1. Verify Azure Search index exists
2. Check index name in `.env`
3. Verify search key has correct permissions
4. Check Azure Search service status

## Deployment

### Cloudflare Pages (Frontend)
1. Set environment variables in Cloudflare Pages settings
2. Only set `REACT_APP_BACKEND_URL` (no Azure keys)
3. Deploy frontend code

### Backend Deployment
1. Deploy to your server (AWS, Azure, Heroku, etc.)
2. Set all environment variables on the server
3. Ensure HTTPS is enabled
4. Configure CORS if needed

## Files Modified

- `src/services/azureOpenAIRagService.ts` - New RAG service
- `src/App.tsx` - Updated to use new service
- `server/config.js` - Updated configuration
- `.env.example` - Updated with new credentials
- `src/services/externalApiService.ts` - REMOVED (old integration)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Azure service documentation
3. Check application logs
4. Contact your IT support team

