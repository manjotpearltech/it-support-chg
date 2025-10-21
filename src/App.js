import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_ENDPOINT = 'https://az.chargercloud.io/api/chat';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (err) {
        console.error('Error loading saved messages:', err);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // New Chat handler
  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Start a new chat? This will clear the current conversation.');
      if (confirmed) {
        setMessages([]);
        localStorage.removeItem('chatMessages');
        setInputValue('');
        setError(null);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await axios.post(API_ENDPOINT, {
        message: userMessage,
      });

      const { response: assistantResponse, timestamp } = response.data;

      // Clean markdown formatting from response
      const cleanedResponse = removeMarkdown(assistantResponse);

      // Add assistant message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: cleanedResponse,
          timestamp: new Date(timestamp),
        },
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'error',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove markdown formatting from text
  const removeMarkdown = (text) => {
    if (!text) return text;

    // Remove bold markers (**)
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');

    // Remove italic markers (*)
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');

    // Remove headers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    return cleaned;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="chat-container">
      {/* Header - Only show when there are messages */}
      {messages.length > 0 && (
        <div className="chat-header">
          <div className="header-title">
            <div className="header-icon">💼</div>
            <div>
              <h1>IT Support Portal</h1>
              <div className="header-subtitle">AI-Powered Support Assistant</div>
            </div>
          </div>
          <button
            className="new-chat-button"
            onClick={handleNewChat}
            title="Start new chat"
          >
            <span className="new-chat-icon">+</span>
            <span className="new-chat-text">New Chat</span>
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">What do you want to know?</div>
            <div className="landing-input-wrapper">
              <form onSubmit={handleSendMessage} className="landing-input-form">
                <textarea
                  ref={textareaRef}
                  className="landing-input-field"
                  placeholder="Ask anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={isLoading}
                  rows="1"
                />
                <div className="landing-input-actions">
                  <button
                    type="button"
                    className="landing-attach-button"
                    title="Attach file (coming soon)"
                    disabled
                  >
                    📎
                  </button>
                  <button
                    type="submit"
                    className="landing-send-button"
                    disabled={isLoading || !inputValue.trim()}
                    title="Send message (Enter)"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'assistant' && (
                  <div className="message-header">
                    <span className="message-icon">✦</span>
                    <span className="message-label">Answer</span>
                  </div>
                )}
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {formatTime(message.timestamp)}
                </div>
                {message.type === 'assistant' && (
                  <div className="message-actions">
                    <button
                      className="action-button"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                      }}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                    <button
                      className="action-button"
                      onClick={() => {
                        // Refresh/regenerate functionality could be added here
                        console.log('Refresh clicked');
                      }}
                      title="Regenerate response"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="message assistant">
                <div className="message-header">
                  <span className="message-icon">✦</span>
                  <span className="message-label">Answer</span>
                </div>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area - Only show when there are messages */}
      {messages.length > 0 && (
        <div className="input-area">
          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '8px' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder="Ask follow-up..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={isLoading}
              rows="1"
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputValue.trim()}
              title="Send message (Enter)"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

