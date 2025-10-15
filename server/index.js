require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AzureSearchService } = require('./services/azure-search');
const { AzureOpenAIService } = require('./services/azure-openai');
const { azureConfig, validateConfig, SYSTEM_PROMPT } = require('./config');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Validate configuration on startup
try {
  validateConfig();
  console.log('✅ Configuration validated');
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      search: !!process.env.AZURE_SEARCH_ENDPOINT,
      openai: !!process.env.AZURE_OPENAI_ENDPOINT
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

    // Initialize Azure services
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
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🤖 IT Support Web App - React Backend Server            ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📡 API endpoint: http://localhost:${PORT}/api/chat
💚 Health check: http://localhost:${PORT}/api/health

Press Ctrl+C to stop
  `);
});

