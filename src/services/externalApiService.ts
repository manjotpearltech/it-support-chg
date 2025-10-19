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

const API_ENDPOINT = 'https://w.chargercloud.io/api/messages';

export class ExternalApiService {
  private userName?: string;
  private userEmail?: string;

  constructor(userName?: string, userEmail?: string) {
    this.userName = userName;
    this.userEmail = userEmail;
    console.log('🌐 External API Service initialized');
    console.log('  Endpoint:', API_ENDPOINT);
    console.log('  User:', userName || 'Not set');
    console.log('  Email:', userEmail || 'Not set');
  }

  /**
   * Send a chat message to the external API
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      console.log('📤 Sending chat message to external API:', userMessage);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          message: userMessage,
          userName: this.userName,
          userEmail: this.userEmail,
        }),
      });

      const data = await response.json();
      console.log('📥 External API response:', data);

      if (!data.success) {
        // If the API returns an error, throw it
        throw new Error(data.error || 'Failed to get response from API');
      }

      return {
        response: data.response,
        citations: data.citations || [],
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ External API error:', error);
      throw error;
    }
  }

  /**
   * Create a support ticket in Zendesk
   */
  async createTicket(
    subject: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<TicketResponse> {
    try {
      console.log('🎫 Creating support ticket:', subject);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_ticket',
          subject: subject,
          description: description,
          userName: userName || this.userName || 'Unknown User',
          userEmail: userEmail || this.userEmail || 'unknown@chargerlogistics.com',
        }),
      });

      const data = await response.json();
      console.log('📥 Ticket creation response:', data);

      return data;
    } catch (error) {
      console.error('❌ Ticket creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket',
        message: 'Unable to create support ticket. Please email helpdesk@chargerlogistics.com directly.',
      };
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ success: boolean; status?: string; timestamp?: string }> {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'health',
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Health check error:', error);
      return {
        success: false,
      };
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
}

/**
 * Get an instance of the external API service
 */
export function getExternalApiService(userName?: string, userEmail?: string): ExternalApiService {
  return new ExternalApiService(userName, userEmail);
}

