/**
 * Cloudflare Worker Service
 * 
 * This service calls your Cloudflare Worker which securely handles Azure OpenAI API calls.
 * No API keys in the frontend - all secrets are stored in Cloudflare.
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
  error?: string;
}

interface TicketResponse {
  success: boolean;
  ticketId?: number;
  ticketUrl?: string;
  message?: string;
  error?: string;
}

export class CloudflareWorkerService {
  private workerUrl: string;
  private userName?: string;
  private userEmail?: string;

  constructor(workerUrl: string, userName?: string, userEmail?: string) {
    this.workerUrl = workerUrl;
    this.userName = userName;
    this.userEmail = userEmail;

    console.log('🔐 Cloudflare Worker Service initialized');
    console.log('  Worker URL:', this.workerUrl);
    console.log('  User:', userName || 'Not set');
  }

  /**
   * Send a chat message to Azure OpenAI via Cloudflare Worker
   */
  async chat(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      console.log('💬 Sending message to Cloudflare Worker...');

      const response = await fetch(`${this.workerUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Worker error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('✅ Response received from Cloudflare Worker');

      return {
        response: data.response,
        citations: data.citations,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('❌ Cloudflare Worker chat error:', error);
      throw error;
    }
  }

  /**
   * Create a support ticket via Cloudflare Worker
   */
  async createTicket(
    subject: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<TicketResponse> {
    try {
      console.log('🎫 Creating ticket via Cloudflare Worker...');

      const response = await fetch(`${this.workerUrl}/api/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          description,
          userName: userName || this.userName,
          userEmail: userEmail || this.userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Worker error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      console.log('✅ Ticket created successfully');

      return data;
    } catch (error) {
      console.error('❌ Cloudflare Worker ticket error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.workerUrl}/api/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
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
   * Update worker URL if needed
   */
  setWorkerUrl(url: string) {
    this.workerUrl = url;
    console.log('🔗 Worker URL updated:', url);
  }
}

/**
 * Get an instance of the Cloudflare Worker service
 */
export function getCloudflareWorkerService(
  workerUrl: string,
  userName?: string,
  userEmail?: string
): CloudflareWorkerService {
  return new CloudflareWorkerService(workerUrl, userName, userEmail);
}

