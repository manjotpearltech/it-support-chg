/**
 * Cloudflare Worker for Azure OpenAI Integration
 * 
 * This worker acts as a secure proxy between your React frontend and Azure OpenAI.
 * API keys are stored as Cloudflare secrets, never exposed to the browser.
 * 
 * Endpoints:
 * - POST /api/chat - Send chat messages to Azure OpenAI
 * - POST /api/ticket - Create support tickets
 * - GET /api/health - Health check
 */

// CORS headers for your React app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Change to your domain in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle CORS preflight requests
 */
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
  });
}

/**
 * Call Azure OpenAI Chat Completion API
 */
async function callAzureOpenAI(messages, env) {
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const apiKey = env.AZURE_OPENAI_API_KEY;
  const deployment = env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  if (!endpoint || !apiKey || !deployment) {
    throw new Error('Azure OpenAI configuration missing');
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  console.log('🔵 Calling Azure OpenAI:', { deployment, messageCount: messages.length });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Azure OpenAI Error:', response.status, errorText);
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Azure OpenAI response received');

  return {
    response: data.choices[0].message.content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create support ticket (mock implementation)
 * Replace with your actual ticketing system API
 */
async function createTicket(subject, description, userName, userEmail, env) {
  console.log('🎫 Creating ticket:', { subject, userName, userEmail });

  // TODO: Replace with your actual ticketing system API
  // For now, return a mock response
  const ticketId = Math.floor(Math.random() * 10000);

  return {
    success: true,
    ticketId: ticketId,
    message: 'Support ticket created successfully!',
    ticketUrl: `https://support.example.com/ticket/${ticketId}`,
  };
}

/**
 * Handle chat endpoint
 */
async function handleChat(request, env) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array for Azure OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are a helpful IT support assistant for Charger Logistics. 
You help employees with IT-related questions about:
- Password resets
- Email issues
- VPN access
- Software installation
- Hardware problems
- Network connectivity
- Printer setup
- CyberGate access

Be friendly, professional, and provide clear step-by-step solutions.
If you cannot solve an issue, suggest creating a support ticket.`,
      },
      ...history,
      {
        role: 'user',
        content: message,
      },
    ];

    const result = await callAzureOpenAI(messages, env);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process chat request',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle ticket creation endpoint
 */
async function handleTicket(request, env) {
  try {
    const body = await request.json();
    const { subject, description, userName, userEmail } = body;

    if (!subject || !description) {
      return new Response(
        JSON.stringify({ error: 'Subject and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await createTicket(subject, description, userName, userEmail, env);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Ticket creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create ticket',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle health check endpoint
 */
function handleHealth() {
  return new Response(
    JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'IT Support Cloudflare Worker',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`📥 ${request.method} ${path}`);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Route requests
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (path === '/api/ticket' && request.method === 'POST') {
      return handleTicket(request, env);
    }

    if (path === '/api/health' && request.method === 'GET') {
      return handleHealth();
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },
};

