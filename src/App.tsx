import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { WelcomeMessage } from './components/WelcomeMessage';
import { DocumentViewer } from './components/DocumentViewer';
import { TicketModal } from './components/TicketModal';
import { PasswordProtection } from './components/PasswordProtection';
import { EmailPromptModal } from './components/EmailPromptModal';
import { AlertCircle, Ticket, RefreshCw } from 'lucide-react';
import { getCloudflareWorkerService } from './services/cloudflareWorkerService';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  timestamp: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    content?: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    content: '',
  });
  const [dividerPosition, setDividerPosition] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [apiService, setApiService] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize Cloudflare Worker service
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Hardcoded Cloudflare Worker URL
        // For local development, you can change this to http://localhost:8787
        const workerUrl = process.env.REACT_APP_WORKER_URL || 'https://az.chargercloud.io';

        const service = getCloudflareWorkerService(workerUrl);
        setApiService(service);
        console.log('✅ Cloudflare Worker Service initialized');
        console.log('🔗 Worker URL:', workerUrl);

        // Test connection
        const isHealthy = await service.healthCheck();
        if (!isHealthy) {
          console.warn('⚠️ Worker health check failed');
        }
      } catch (err) {
        console.error('❌ Service initialization error:', err);
        setError('Failed to initialize worker service');
      }
    };

    initializeService();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const pct = (x / rect.width) * 100;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setDividerPosition(Math.min(Math.max(pct, 5), 95));
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      if (pointerIdRef.current !== null) {
        try {
          const handle = document.getElementById('divider-handle');
          handle?.releasePointerCapture(pointerIdRef.current);
        } catch {}
      }
      pointerIdRef.current = null;
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleOpenDocument = (title: string, url: string, content?: string) => {
    setDocumentViewer({
      isOpen: true,
      title,
      url,
      content: content || '',
    });
  };

  const handleCloseDocument = () => {
    setDocumentViewer(prev => ({ ...prev, isOpen: false }));
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    if (!apiService) {
      setError('Service not initialized. Please refresh the page.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Use Cloudflare Worker service
      const data = await apiService.chat(
        content,
        messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }))
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        timestamp: data.timestamp,
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];

        // Check if we have 3 or more user messages (after adding this one)
        const userMessageCount = newMessages.filter(m => m.role === 'user').length;

        // Auto-prompt for ticket after 3 user messages
        if (userMessageCount === 3) {
          setTimeout(() => {
            setIsEmailPromptOpen(true);
          }, 1000); // Delay to let user see the response first
        }

        return newMessages;
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (
    subject: string,
    description: string,
    userName: string,
    userEmail: string
  ) => {
    if (!apiService) {
      throw new Error('Service not initialized. Please refresh the page.');
    }

    const result = await apiService.createTicket(subject, description, userName, userEmail);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to create ticket');
    }

    // Show success message in chat
    const ticketMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ ${result.message || 'Support ticket created successfully!'}\n\n**Ticket ID:** ${result.ticketId}\n\nYou'll receive an email confirmation shortly.`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, ticketMessage]);
  };

  const handleEmailPromptSubmit = async (email: string, name: string) => {
    if (!apiService) {
      throw new Error('Service not initialized. Please refresh the page.');
    }

    // Create conversation summary
    const conversationSummary = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const subject = 'IT Support Request - Conversation History';
    const description = `Conversation History:\n\n${conversationSummary}`;

    const result = await apiService.createTicket(subject, description, name, email);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to create ticket');
    }

    // Show success message in chat
    const ticketMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Support ticket created successfully! Ticket ID: ${result.ticketId}\n\nWe've sent a confirmation to ${email}. Our team will follow up with you shortly.`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, ticketMessage]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setDocumentViewer({
      isOpen: false,
      title: '',
      url: '',
      content: ''
    });
  };

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div ref={containerRef} className="app-container">
      {/* Main Chat Area */}
      <div
        className="chat-area"
        style={{ width: documentViewer.isOpen ? `${dividerPosition}%` : '100%' }}
      >
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Charger Logistics IT Support</h1>
              <p>⚡ Fast, AI-powered assistance</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="ticket-btn"
                title="Create Support Ticket"
              >
                <Ticket size={20} />
                Create Ticket
              </button>
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="new-chat-btn"
                  title="Start New Conversation"
                >
                  <RefreshCw size={18} />
                  New Chat
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <WelcomeMessage onSampleQuestion={handleSendMessage} />
          ) : (
            <div className="messages-container">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  citations={message.citations}
                  timestamp={message.timestamp}
                  onOpenDocument={handleOpenDocument}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Resizable Divider */}
      {documentViewer.isOpen && (
        <div
          className={`divider ${isDragging ? 'dragging' : ''}`}
          id="divider-handle"
          onPointerDown={handleDividerPointerDown}
        >
          <div className="divider-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
          <div className="divider-line" />
        </div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={documentViewer.isOpen}
        onClose={handleCloseDocument}
        documentTitle={documentViewer.title}
        documentUrl={documentViewer.url}
        documentContent={documentViewer.content}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Email Prompt Modal (Auto-triggered after 3 messages) */}
      <EmailPromptModal
        isOpen={isEmailPromptOpen}
        onClose={() => setIsEmailPromptOpen(false)}
        onSubmit={handleEmailPromptSubmit}
      />
    </div>
  );
}

export default App;

