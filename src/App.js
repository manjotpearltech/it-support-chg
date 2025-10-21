import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_ENDPOINT = 'https://az.chargercloud.io/api/chat';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load messages and category from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedCategory = localStorage.getItem('selectedCategory');

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

    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save selected category to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedCategory', selectedCategory);
    }
  }, [selectedCategory]);

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

  // Category selection handler
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // New Chat handler
  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Start a new chat? This will clear the current conversation.');
      if (confirmed) {
        setMessages([]);
        setSelectedCategory(null);
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('selectedCategory');
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
        category: selectedCategory, // Send selected category to backend
      });

      const { response: assistantResponse, timestamp } = response.data;

      // Format markdown (keep bold, remove other formatting)
      const formattedResponse = formatMarkdown(assistantResponse);

      // Add assistant message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: formattedResponse,
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

  // Format markdown text for display (keep bold, remove other formatting)
  const formatMarkdown = (text) => {
    if (!text) return text;

    // Keep the text as-is for now - we'll handle bold with CSS
    // Remove italic markers (*)
    let formatted = text.replace(/\*([^*]+)\*/g, '$1');

    // Remove headers (# ## ###)
    formatted = formatted.replace(/^#{1,6}\s+/gm, '');

    return formatted;
  };

  // Render message content with bold formatting
  const renderMessageContent = (content) => {
    if (!content) return '';

    // Split by ** markers and wrap bold text in <strong> tags
    const parts = content.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and wrap in strong tag
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
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
            <div className="header-icon">
              {selectedCategory === 'IT Support' && '💻'}
              {selectedCategory === 'App Support' && '📱'}
              {selectedCategory === 'HR Support' && '👥'}
              {!selectedCategory && '💼'}
            </div>
            <div>
              <h1>{selectedCategory || 'Support Portal'}</h1>
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
            <div className="welcome-header">
              <h1 className="welcome-title">Welcome to <span className="brand-highlight">ChargerSupportAI</span></h1>
              <p className="welcome-subtitle">Get instant help with IT, applications, and HR questions</p>
            </div>

            {/* Category Selection Boxes - Always visible */}
            <div className="category-grid">
              <div
                className={`category-box ${selectedCategory === 'IT Support' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('IT Support')}
              >
                <div className="category-icon">💻</div>
                <div className="category-title">IT Support</div>
                <div className="category-description">
                  Get help with technical issues
                </div>
                <div className="category-guidance">
                  <div className="guidance-item">• Reset passwords</div>
                  <div className="guidance-item">• VPN & network access</div>
                  <div className="guidance-item">• Software installation</div>
                  <div className="guidance-item">• Hardware troubleshooting</div>
                </div>
              </div>

              <div
                className={`category-box ${selectedCategory === 'App Support' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('App Support')}
              >
                <div className="category-icon">📱</div>
                <div className="category-title">App Support</div>
                <div className="category-description">
                  Application assistance
                </div>
                <div className="category-guidance">
                  <div className="guidance-item">• CyberGate access</div>
                  <div className="guidance-item">• Video call setup</div>
                  <div className="guidance-item">• OpenPath door access</div>
                  <div className="guidance-item">• App troubleshooting</div>
                </div>
              </div>

              <div
                className={`category-box ${selectedCategory === 'HR Support' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('HR Support')}
              >
                <div className="category-icon">👥</div>
                <div className="category-title">HR Support</div>
                <div className="category-description">
                  Human resources help
                </div>
                <div className="category-guidance">
                  <div className="guidance-item">• Benefits & insurance</div>
                  <div className="guidance-item">• Payroll questions</div>
                  <div className="guidance-item">• Time off requests</div>
                  <div className="guidance-item">• HR policies</div>
                </div>
              </div>
            </div>

            {/* Input Area - Always visible on landing page */}
            <div className="landing-input-wrapper">
              {selectedCategory && (
                <div className="selected-category-badge">
                  {selectedCategory === 'IT Support' && '💻'}
                  {selectedCategory === 'App Support' && '📱'}
                  {selectedCategory === 'HR Support' && '👥'}
                  <span>{selectedCategory}</span>
                  <button
                    className="change-category-btn"
                    onClick={() => setSelectedCategory(null)}
                    title="Change category"
                  >
                    ✕
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="landing-input-form">
                <textarea
                  ref={textareaRef}
                  className="landing-input-field"
                  placeholder={selectedCategory ? `Ask about ${selectedCategory}...` : "Ask anything..."}
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
          <div className="conversation-container">
            {messages.map((message, index) => (
              <div key={message.id} className={`message-wrapper ${message.type}`}>
                <div className={`message ${message.type}`}>
                  {message.type === 'user' && (
                    <div className="message-meta">
                      <span className="message-sender">You</span>
                      <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                    </div>
                  )}
                  {message.type === 'assistant' && (
                    <div className="message-header">
                      <div className="message-meta">
                        <div className="answer-label">
                          <span className="message-icon">✦</span>
                          <span className="message-label">Answer</span>
                        </div>
                        <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  )}
                  <div className="message-content">
                    {message.type === 'assistant'
                      ? renderMessageContent(message.content)
                      : message.content
                    }
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
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message assistant">
                  <div className="message-header">
                    <div className="message-meta">
                      <div className="answer-label">
                        <span className="message-icon">✦</span>
                        <span className="message-label">Answer</span>
                      </div>
                    </div>
                  </div>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
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

