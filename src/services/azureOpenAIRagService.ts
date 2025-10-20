/**
 * Azure OpenAI RAG Service
 * 
 * This service integrates with Azure OpenAI using Retrieval Augmented Generation (RAG)
 * with Azure Search for knowledge base grounding.
 * 
 * Security: Uses backend proxy pattern - credentials are kept on the server,
 * frontend only communicates with the backend API.
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

/**
 * Azure OpenAI RAG Service
 * Communicates with backend API which handles Azure credentials securely
 */
export class AzureOpenAIRagService {
  private backendUrl: string;
  private userName?: string;
  private userEmail?: string;

  constructor(userName?: string, userEmail?: string) {
    // Use backend API endpoint
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    this.userName = userName;
    this.userEmail = userEmail;
    
    console.log('🔐 Azure OpenAI RAG Service initialized');
    console.log('  Backend URL:', this.backendUrl);
    console.log('  User:', userName || 'Not set');
    console.log('  Email:', userEmail || 'Not set');
  }

  /**
   * Send a chat message to the backend which calls Azure OpenAI with RAG
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      console.log('📤 Sending chat message to backend:', userMessage);

      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          userName: this.userName,
          userEmail: this.userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Backend error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('📥 Backend response:', data);

      return {
        response: data.response || '',
        citations: data.citations || [],
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw error;
    }
  }

  /**
   * Create a support ticket
   */
  async createTicket(
    subject: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<TicketResponse> {
    try {
      console.log('🎫 Creating support ticket:', subject);

      const response = await fetch(`${this.backendUrl}/api/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          description,
          userName: userName || this.userName || 'Unknown User',
          userEmail: userEmail || this.userEmail || 'unknown@company.com',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Backend error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Ticket created:', data);

      return data;
    } catch (error) {
      console.error('❌ Ticket creation error:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async healthCheck(): Promise<{ success: boolean; status?: string; timestamp?: string }> {
    try {
      const response = await fetch(`${this.backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false };
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('❌ Health check error:', error);
      return { success: false };
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
   * Set backend URL (useful for testing or dynamic configuration)
   */
  setBackendUrl(url: string) {
    this.backendUrl = url;
    console.log('🔗 Backend URL updated:', url);
  }
}

/**
 * Get an instance of the Azure OpenAI RAG service
 */
export function getAzureOpenAIRagService(
  userName?: string,
  userEmail?: string
): AzureOpenAIRagService {
  return new AzureOpenAIRagService(userName, userEmail);
}

