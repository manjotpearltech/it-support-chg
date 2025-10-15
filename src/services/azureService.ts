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

const SYSTEM_PROMPT = `You are a helpful IT support assistant for Charger Logistics.
You provide clear, concise answers to IT-related questions.
Always be professional and helpful.
If you don't know something, admit it and suggest contacting IT support.`;

export class AzureOpenAIService {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;

  constructor() {
    const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.REACT_APP_AZURE_OPENAI_KEY;
    const deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

    console.log('🔍 Azure Service Init:');
    console.log('  Endpoint:', endpoint ? '✅ Set' : '❌ Not set');
    console.log('  API Key:', apiKey ? '✅ Set' : '❌ Not set');
    console.log('  Deployment:', deploymentName);

    if (!endpoint || !apiKey) {
      console.error('❌ Azure OpenAI credentials not configured');
      throw new Error('Azure OpenAI credentials not configured');
    }

    console.log('✅ Azure Service initialized successfully');
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.deploymentName = deploymentName;
  }

  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      // Call Azure OpenAI REST API directly
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2025-01-01-preview`;
      console.log('📤 Calling Azure API:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 700,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Azure API error:', response.status, errorText);
        throw new Error(`Azure API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Azure response received:', data);

      const assistantMessage = data.choices[0]?.message?.content || '';

      return {
        response: assistantMessage,
        citations: [
          {
            title: 'IT Support Knowledge Base',
            url: 'https://support.chargercloud.io/kb',
            content: 'Related documentation',
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Azure OpenAI error:', error);
      throw error;
    }
  }
}

export function getAzureService(): AzureOpenAIService {
  // Always create a new instance to ensure we get fresh environment variables
  // This is important for development where env vars might change
  try {
    return new AzureOpenAIService();
  } catch (error) {
    throw error;
  }
}

