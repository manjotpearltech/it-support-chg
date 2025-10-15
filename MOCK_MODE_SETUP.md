# Mock Mode Setup Guide

## Overview
The application now supports **Mock Mode** for testing without Azure credentials. This allows you to test the full UI and functionality with realistic mock responses.

## Quick Start

### Start the Application
```bash
npm run dev
```

This command will:
1. Start the backend server on `http://localhost:5001` (Mock Mode)
2. Start the React app on `http://localhost:3000`
3. Automatically proxy API calls from the React app to the backend

### Access the App
Open your browser and navigate to:
```
http://localhost:3000
```

## What's Included in Mock Mode

### Mock Responses
The mock API provides realistic responses for common IT support questions:

- **Password Reset**: Instructions for resetting passwords
- **VPN Setup**: Steps to connect to company VPN
- **Email Troubleshooting**: Common email issue solutions
- **Printer Configuration**: Network printer setup guide
- **Software Requests**: How to request new software
- **Default Response**: General IT support greeting

### Features
- ✅ Realistic response delays (800-1200ms) to simulate network latency
- ✅ Mock citations and knowledge base references
- ✅ Full chat history support
- ✅ Typing indicators and loading states
- ✅ Error handling and edge cases
- ✅ All UI components fully functional

## Testing the Mock API

### Test Keywords
Try asking questions with these keywords to see different mock responses:

1. **"password"** - Password reset instructions
2. **"vpn"** - VPN setup guide
3. **"email"** - Email troubleshooting
4. **"printer"** - Printer configuration
5. **"software"** - Software request process
6. **Any other question** - Default IT support response

### Example Questions
- "How do I reset my password?"
- "Help me set up VPN"
- "I'm having email issues"
- "How do I add a printer?"
- "I need new software"

## Server Modes

### Mock Mode (Default)
- **Enabled when**: No Azure credentials are configured
- **Port**: 5001
- **Features**: Mock responses, no external dependencies
- **Use case**: Development, testing, demos

### Production Mode
- **Enabled when**: Azure credentials are configured in `.env`
- **Port**: 5001
- **Features**: Real Azure OpenAI and Search integration
- **Use case**: Production deployment

## Switching to Production Mode

To use real Azure services:

1. Create a `.env` file in the root directory:
```
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-api-key
AZURE_SEARCH_INDEX=your-index-name
AZURE_OPENAI_ENDPOINT=https://your-openai-service.cognitiveservices.azure.com
AZURE_OPENAI_KEY=your-openai-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

2. Restart the server:
```bash
npm run dev
```

The server will automatically detect the credentials and switch to production mode.

## Server Logs

When running in mock mode, you'll see:
```
🎭 Running in MOCK_MODE - No Azure credentials needed

╔════════════════════════════════════════════════════════════╗
║   🤖 IT Support Web App - React Backend Server            ║
║   🎭 MOCK MODE
╚════════════════════════════════════════════════════════════╝

🚀 Server running on port 5001
📡 API endpoint: http://localhost:5001/api/chat
💚 Health check: http://localhost:5001/api/health

✨ Mock responses enabled - No Azure credentials needed!
```

## Health Check

Test the API health:
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "ok",
  "mode": "mock",
  "timestamp": "2025-10-15T20:30:00.000Z",
  "services": {
    "search": true,
    "openai": true
  }
}
```

## Testing the Chat API

### Using curl
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I reset my password?",
    "conversationHistory": []
  }'
```

### Response
```json
{
  "response": "To reset your password, follow these steps...",
  "citations": [
    {
      "title": "IT Support Knowledge Base",
      "url": "https://support.chargercloud.io/kb/article-123",
      "content": "Related documentation"
    }
  ],
  "timestamp": "2025-10-15T20:30:00.000Z"
}
```

## Troubleshooting

### Port Already in Use
If port 3000 or 5001 is already in use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### React App Not Starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Not Responding
Check if the backend is running:
```bash
curl http://localhost:5001/api/health
```

If not responding, restart:
```bash
npm run dev
```

## UI Testing

The mock mode is perfect for testing:
- ✅ Responsive design on all screen sizes
- ✅ Chat message display and formatting
- ✅ Input handling and message sending
- ✅ Loading states and animations
- ✅ Error handling
- ✅ Citation display
- ✅ Conversation history
- ✅ Mobile responsiveness

## Next Steps

1. **Test the UI**: Try the app on different screen sizes
2. **Test Chat**: Send various messages to see mock responses
3. **Test Responsiveness**: Use browser DevTools to test mobile views
4. **Prepare for Production**: Configure Azure credentials when ready
5. **Deploy**: Push to GitHub and deploy to Cloudflare Pages

## Files Modified

- `server/index.js` - Added mock mode support
- `package.json` - Already configured with proxy and dev script

## Support

For issues or questions:
1. Check the server logs in the terminal
2. Verify ports 3000 and 5001 are available
3. Ensure Node.js and npm are properly installed
4. Check the health endpoint: `http://localhost:5001/api/health`

