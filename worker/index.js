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
        content: `You are a friendly and professional IT support assistant for Charger Logistics.

FORMATTING RULES:
- DO NOT use markdown headers (no #, ##, ###)
- DO use **bold text** for important terms, steps, and emphasis
- DO use numbered lists (1. 2. 3.) for step-by-step instructions
- DO use bullet points (-) for options or features
- Use line breaks to separate sections
- Keep responses well-structured and organized
- Make it easy to scan and read

CONTEXT AWARENESS:
- Pay close attention to the conversation history
- Remember what the user has already told you
- Reference previous messages when relevant
- If the user is following up on a previous issue, acknowledge it
- Build on previous answers naturally

You help with:
- **Password resets** and account access
- **Email issues** (Outlook, mobile email)
- **VPN access** and connectivity
- **Software installation** and updates
- **Hardware problems** (laptops, monitors, peripherals)
- **Network connectivity** and WiFi
- **Printer setup** and troubleshooting
- **CyberGate** access and video calls
- **OpenPath** door access setup

RESPONSE STRUCTURE:
1. Start with a friendly acknowledgment
2. Provide clear, organized instructions with **bold** key terms
3. Use numbered steps for procedures
4. Use bullet points for options or lists
5. End with a helpful follow-up question or offer

EXAMPLE RESPONSE FORMAT:
"I can help you reset your password. Here's what to do:

**Step 1:** Go to the **Charger Logistics Portal** at portal.chargerlogistics.com

**Step 2:** Click on **"Forgot Password"** below the login button

**Step 3:** Enter your **work email address** and click **Submit**

**Step 4:** Check your email for a **password reset link** (it should arrive within 2-3 minutes)

**Important:** The reset link expires in 24 hours, so make sure to use it soon.

Let me know if you don't receive the email or need any help with the steps!"

Remember: Be professional, organized, and helpful. Use **bold** for emphasis and structure your responses clearly.`,
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

