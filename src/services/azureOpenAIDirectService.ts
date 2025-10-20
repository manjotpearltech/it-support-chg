/**
 * Azure OpenAI Direct Service
 *
 * This service calls Azure OpenAI directly from the frontend.
 * No backend server needed - perfect for Cloudflare Pages deployment.
 *
 * Security: Uses Azure API Key authentication.
 * Get API key from Azure Portal: Your OpenAI Resource → Keys and Endpoint
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  response: string;
  citations?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  timestamp: string;
}

interface TicketResponse {
  success: boolean;
  ticketId?: number;
  ticketUrl?: string;
  message?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a helpful IT support assistant for Charger Logistics.
You provide clear, concise answers to IT-related questions.
Always be professional and helpful.
If you don't know something, admit it and suggest contacting IT support.`;

/**
 * Azure OpenAI Direct Service
 * Calls Azure OpenAI directly from the frontend using API Key authentication
 */
export class AzureOpenAIDirectService {
  private endpoint: string;
  private deploymentName: string;
  private apiVersion: string;
  private apiKey: string;
  private userName?: string;
  private userEmail?: string;

  constructor(apiKey: string, userName?: string, userEmail?: string) {
    this.endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || '';
    this.deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    this.apiVersion = process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    this.apiKey = apiKey;
    this.userName = userName;
    this.userEmail = userEmail;

    if (!this.endpoint) {
      throw new Error('Azure OpenAI endpoint not configured');
    }

    console.log('🔐 Azure OpenAI Direct Service initialized');
    console.log('  Endpoint:', this.endpoint);
    console.log('  Deployment:', this.deploymentName);
    console.log('  User:', userName || 'Not set');
  }

  /**
   * Send a chat message directly to Azure OpenAI
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      console.log('📤 Sending chat message to Azure OpenAI:', userMessage);

      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 6553,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Azure API error:', response.status, errorData);
        throw new Error(
          errorData.error?.message || `Azure API error: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('📥 Azure response:', data);

      const assistantMessage = data.choices?.[0]?.message?.content || '';

      return {
        response: assistantMessage,
        citations: [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw error;
    }
  }

  /**
   * Create a support ticket (mock implementation)
   * In production, you might want to integrate with Zendesk or another ticketing system
   */
  async createTicket(
    subject: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<TicketResponse> {
    try {
      console.log('🎫 Creating support ticket:', subject);

      // Mock ticket creation - replace with real API call if needed
      const ticketId = Math.floor(Math.random() * 100000);

      return {
        success: true,
        ticketId,
        message: `Support ticket created successfully! Ticket ID: ${ticketId}`,
      };
    } catch (error) {
      console.error('❌ Ticket creation error:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  setUserInfo(userName?: string, userEmail?: string) {
    this.userName = userName;
    this.userEmail = userEmail;
    console.log('👤 User info updated:', { userName, userEmail });
  }

  /**
   * Update API key if needed
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log('🔑 API key updated');
  }
}

/**
 * Get an instance of the Azure OpenAI Direct service
 */
export function getAzureOpenAIDirectService(
  apiKey: string,
  userName?: string,
  userEmail?: string
): AzureOpenAIDirectService {
  return new AzureOpenAIDirectService(apiKey, userName, userEmail);
}

