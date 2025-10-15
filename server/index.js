require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AzureSearchService } = require('./services/azure-search');
const { AzureOpenAIService } = require('./services/azure-openai');
const { azureConfig, validateConfig, SYSTEM_PROMPT } = require('./config');

const app = express();
const PORT = process.env.PORT || 5001;

// Check if running in mock mode
const MOCK_MODE = process.env.MOCK_MODE === 'true' || !process.env.AZURE_OPENAI_ENDPOINT;

// Middleware
app.use(cors());
app.use(express.json());

// Validate configuration on startup
if (!MOCK_MODE) {
  try {
    validateConfig();
    console.log('✅ Configuration validated');
  } catch (error) {
    console.error('❌ Configuration error:', error.message);
    console.log('💡 Falling back to MOCK_MODE for testing...');
  }
} else {
  console.log('🎭 Running in MOCK_MODE - No Azure credentials needed');
}

// Mock responses for testing
const mockResponses = {
  'password': 'To reset your password, follow these steps: 1) Click "Forgot Password" on the login page, 2) Enter your email address, 3) Check your email for a reset link, 4) Click the link and create a new password. If you don\'t receive an email within 5 minutes, check your spam folder or contact IT support.',
  'vpn': 'To connect to the VPN, download the **Cisco AnyConnect** client from our IT portal. Install it, then open the application and enter the server address: vpn.chargercloud.io. Use your company credentials to authenticate. For detailed instructions, see the VPN Setup Guide in the knowledge base.',
  'email': 'Email issues can usually be resolved by: 1) Checking your internet connection, 2) Restarting Outlook or your email client, 3) Clearing your cache, 4) Checking if your mailbox is full. If the problem persists, contact the IT Help Desk with your email address and error message.',
  'printer': 'To add a network printer: 1) Go to Settings > Devices > Printers & Scanners, 2) Click "Add a printer or scanner", 3) Search for your printer model, 4) Select it and click "Add device". For wireless printers, ensure your device is on the same network. Need help? Contact IT support.',
  'software': 'To request new software, submit a ticket through the IT Portal with: 1) Software name and version, 2) Business justification, 3) Number of licenses needed, 4) Department approval. Requests are typically processed within 2-3 business days.',
  'default': 'Thank you for your question! I\'m here to help with IT support issues. I can assist with: **Password resets**, **VPN setup**, **Email troubleshooting**, **Printer configuration**, and **Software requests**. What can I help you with today?'
};

// Sanitize model output to plain, natural text while preserving **bold**
function sanitizePlainText(text) {
  return text
    // Keep **bold** so the UI can emphasize key terms
    // Strip backticks and italics underscores
    .replace(/`+/g, '')
    .replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1$2')
    // Remove markdown headers like ### Heading
    .replace(/(^|\n)\s*#{1,6}\s*/g, '$1')
    // Normalize extra spaces
    .replace(/[\t ]+/g, ' ')
    .trim();
}

// Get mock response based on user message
function getMockResponse(message) {
  const lowerMessage = message.toLowerCase();

  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  return mockResponses.default;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: MOCK_MODE ? 'mock' : 'production',
    timestamp: new Date().toISOString(),
    services: {
      search: MOCK_MODE ? true : !!process.env.AZURE_SEARCH_ENDPOINT,
      openai: MOCK_MODE ? true : !!process.env.AZURE_OPENAI_ENDPOINT
    }
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Mock mode response
    if (MOCK_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

      const mockResponse = getMockResponse(message);

      return res.json({
        response: mockResponse,
        citations: [
          {
            title: 'IT Support Knowledge Base',
            url: 'https://support.chargercloud.io/kb/article-123',
            content: 'Related documentation'
          }
        ],
        timestamp: new Date().toISOString(),
      });
    }

    // Production mode - use Azure services
    const searchService = new AzureSearchService(
      azureConfig.search.endpoint,
      azureConfig.search.index,
      azureConfig.search.key
    );

    const openaiService = new AzureOpenAIService(
      azureConfig.openai.endpoint,
      azureConfig.openai.key,
      azureConfig.openai.deployment,
      azureConfig.openai.apiVersion
    );

    // Search the knowledge base
    const searchResults = await searchService.search(message, azureConfig.search.topN);

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Generate response using Azure OpenAI with grounding
    const response = await openaiService.generateResponse(
      messages,
      searchResults.results,
      azureConfig.openai.temperature,
      azureConfig.openai.maxTokens
    );

    const cleaned = sanitizePlainText(response.content || '');

    res.json({
      response: cleaned,
      citations: response.citations,
      searchResults: searchResults.results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);

    res.status(500).json({
      error: 'An error occurred while processing your request. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Blob proxy endpoint for document viewing
app.get('/api/blob', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate the URL is from allowed blob hosts
    const allowedHosts = (process.env.ALLOWED_BLOB_HOSTS || '').split(',').map(h => h.trim());
    const urlObj = new URL(url);
    
    if (!allowedHosts.some(host => urlObj.hostname.includes(host))) {
      return res.status(403).json({ error: 'Access to this resource is not allowed' });
    }

    // Add SAS token if available
    const sasToken = process.env.AZURE_BLOB_SAS;
    const finalUrl = sasToken && !url.includes('?') 
      ? `${url}?${sasToken}` 
      : url;

    // Fetch the blob
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(finalUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    // Forward the content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Stream the response
    response.body.pipe(res);

  } catch (error) {
    console.error('Blob proxy error:', error);
    res.status(500).json({
      error: 'Failed to fetch document',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  const modeLabel = MOCK_MODE ? '🎭 MOCK MODE' : '🔌 PRODUCTION MODE';
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🤖 IT Support Web App - React Backend Server            ║
║   ${modeLabel}
╚════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📡 API endpoint: http://localhost:${PORT}/api/chat
💚 Health check: http://localhost:${PORT}/api/health

${MOCK_MODE ? '✨ Mock responses enabled - No Azure credentials needed!\n' : ''}
Press Ctrl+C to stop
  `);
});

