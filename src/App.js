import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { useStreamingChat } from './hooks/useStreamingChat';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Use streaming chat hook
  const { messages, sendMessage, isStreaming, cancelStreaming, clearMessages, error } = useStreamingChat();

  // Load category from localStorage on mount
  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

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
        clearMessages();
        setSelectedCategory(null);
        localStorage.removeItem('selectedCategory');
        setInputValue('');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isStreaming) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');

    // Send message using streaming hook
    await sendMessage(userMessage);
  };

  // Handle example query clicks
  const handleExampleClick = (query) => {
    setInputValue(query);
    textareaRef.current?.focus();
  };

  // Render message content with bold formatting and line breaks
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
      // Preserve line breaks
      return part.split('\n').map((line, i, arr) => (
        <React.Fragment key={`${index}-${i}`}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
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
              <h1 className="welcome-title">👋 Welcome to IT Support</h1>
              <p className="welcome-subtitle">Ask questions about IT procedures and SOPs</p>
            </div>

            {/* Example Queries */}
            <div className="example-queries">
              <button
                className="example-query-btn"
                onClick={() => handleExampleClick('How do I reset my Okta password?')}
              >
                How do I reset my Okta password?
              </button>
              <button
                className="example-query-btn"
                onClick={() => handleExampleClick('VPN connection issues')}
              >
                VPN connection issues
              </button>
              <button
                className="example-query-btn"
                onClick={() => handleExampleClick('How to setup email on my phone?')}
              >
                How to setup email on my phone?
              </button>
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
                  placeholder={selectedCategory ? `Ask about ${selectedCategory}... (Press Enter to send)` : "Ask anything... (Press Enter to send)"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={isStreaming}
                  rows="1"
                />
                <div className="landing-input-actions">
                  <button
                    type="submit"
                    className="landing-send-button"
                    disabled={isStreaming || !inputValue.trim()}
                    title="Send message (Enter)"
                  >
                    {isStreaming ? '⏳' : '➤'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="conversation-container">
            {messages.map((message, index) => (
              <div key={message.id} className={`message-wrapper ${message.role}`}>
                <div className={`message ${message.role} ${message.isError ? 'error' : ''}`}>
                  {message.role === 'user' && (
                    <div className="message-meta">
                      <span className="message-sender">You</span>
                      <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                    </div>
                  )}
                  {message.role === 'assistant' && (
                    <div className="message-header">
                      <div className="message-meta">
                        <div className="answer-label">
                          <span className="message-icon">✦</span>
                          <span className="message-label">Answer</span>
                          {!message.isComplete && (
                            <span className="streaming-indicator">AI is responding...</span>
                          )}
                        </div>
                        <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  )}
                  <div className="message-content">
                    {message.role === 'assistant'
                      ? renderMessageContent(message.content)
                      : message.content
                    }
                  </div>

                  {/* Source Citations */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-header">📄 Sources</div>
                      <div className="sources-list">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="source-item">
                            <span className="source-filename">{source.filename}</span>
                            {source.score && (
                              <span className="source-score">
                                {Math.round(source.score * 100)}% match
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.role === 'assistant' && message.isComplete && !message.isError && (
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
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Show typing indicator when streaming starts */}
            {isStreaming && messages.length > 0 && !messages[messages.length - 1].content && (
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
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder={isStreaming ? "AI is responding..." : "Ask follow-up... (Press Enter to send, Shift+Enter for new line)"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={isStreaming}
              rows="1"
            />
            {isStreaming ? (
              <button
                type="button"
                className="stop-button"
                onClick={cancelStreaming}
                title="Stop generating"
              >
                ⏹ Stop
              </button>
            ) : (
              <button
                type="submit"
                className="send-button"
                disabled={!inputValue.trim()}
                title="Send message (Enter)"
              >
                {inputValue.trim() ? '➤' : '⏳'}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

