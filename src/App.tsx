import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { WelcomeMessage } from './components/WelcomeMessage';
import { DocumentViewer } from './components/DocumentViewer';
import { AlertCircle } from 'lucide-react';
import { getAzureService } from './services/azureService';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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
      // Try to use Azure service if credentials are available
      try {
        const azureService = getAzureService();
        const data = await azureService.chat(
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

        setMessages(prev => [...prev, assistantMessage]);
      } catch (azureError) {
        // Fallback to backend API if Azure is not configured
        console.error('❌ Azure error:', azureError);
        console.log('Azure not configured, trying backend API...');

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            conversationHistory: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          citations: data.citations,
          timestamp: data.timestamp,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setError(null);
                  setDocumentViewer({
                    isOpen: false,
                    title: '',
                    url: '',
                    content: ''
                  });
                }}
                className="new-chat-btn"
              >
                New Chat
              </button>
            )}
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
    </div>
  );
}

export default App;

