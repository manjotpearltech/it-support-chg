import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import './ChatInput.css';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="input-wrapper">
        <div className="textarea-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask an IT question..."
            className="message-textarea"
            rows={1}
            disabled={isLoading || disabled}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="send-button"
        >
          {isLoading ? (
            <Loader2 size={20} className="spinner" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      
      <div className="input-hint">
        Enter to send • Shift+Enter = new line
      </div>
    </form>
  );
}

