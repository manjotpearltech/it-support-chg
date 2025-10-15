import React from 'react';
import { Bot } from 'lucide-react';
import './TypingIndicator.css';

export function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-wrapper">
        <div className="typing-avatar">
          <Bot size={16} />
        </div>
        <div className="typing-content">
          <div className="typing-header">
            <span className="typing-sender">IT Support Assistant</span>
          </div>
          <div className="typing-bubble">
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

