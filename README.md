# IT Support Chatbot

An AI-powered IT support web application for Charger Logistics, built with Next.js and integrated with Azure Cognitive Search and Azure OpenAI.

## Features

- 🤖 **AI-Powered Responses**: Uses Azure OpenAI GPT-4o Mini for intelligent responses
- 🔍 **Knowledge Base Search**: Semantic search through IT documentation using Azure Cognitive Search
- 📚 **Source Citations**: Shows which documents were used to generate responses
- 💬 **Modern Chat Interface**: Clean, responsive chat UI with typing indicators
- 🚀 **Real-time**: Instant responses with conversation history
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Frontend**: Next.js 15 with React and TypeScript
- **Styling**: Tailwind CSS
- **Search**: Azure Cognitive Search with semantic ranking
- **AI**: Azure OpenAI with grounded responses
- **Knowledge Base**: Azure Blob Storage with indexed documents

## Setup

### Prerequisites

- Node.js 18+
- Azure subscription with:
  - Azure Cognitive Search service
  - Azure OpenAI service
  - Azure Blob Storage (for knowledge base)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd it-support-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Azure credentials:
```env
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-api-key
AZURE_SEARCH_INDEX=your-index-name

AZURE_OPENAI_ENDPOINT=https://your-openai-service.cognitiveservices.azure.com
AZURE_OPENAI_KEY=your-openai-api-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Ask Questions**: Type any IT-related question in the chat interface
2. **View Sources**: See which documents were used to generate the response
3. **Sample Questions**: Click on suggested questions to get started
4. **Conversation History**: Previous messages are maintained during the session

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Main chat endpoint for sending messages

## Configuration

### Azure Cognitive Search

The application expects an Azure Search index with the following fields:
- `content` - Document text content
- `metadata_storage_name` - Document filename
- `metadata_storage_path` - Blob storage URL (Base64 encoded)

### Azure OpenAI

Uses the chat completions API with data sources for grounded responses. The system prompt is configured for IT support scenarios.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Azure Static Web Apps
- AWS Amplify
- Netlify
- Docker containers

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat API endpoint
│   │   └── health/route.ts    # Health check
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat page
├── components/
│   ├── ChatInput.tsx          # Message input component
│   ├── ChatMessage.tsx        # Message display component
│   ├── TypingIndicator.tsx    # Loading indicator
│   └── WelcomeMessage.tsx     # Welcome screen
└── lib/
    ├── azure-openai.ts        # Azure OpenAI integration
    ├── azure-search.ts        # Azure Search integration
    └── config.ts              # Configuration and validation
```

### Adding New Features

1. **New Components**: Add React components in `src/components/`
2. **API Routes**: Add new endpoints in `src/app/api/`
3. **Azure Services**: Extend integrations in `src/lib/`

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set in `.env.local`
2. **Azure Permissions**: Verify API keys have proper permissions
3. **CORS Errors**: Azure OpenAI calls must be made server-side
4. **Search Index**: Ensure the search index exists and has data

### Health Check

Visit `/api/health` to verify Azure service connectivity.

## License

This project is licensed under the MIT License.
