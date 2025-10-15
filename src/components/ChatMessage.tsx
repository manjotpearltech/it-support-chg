import React from 'react';
import { User, Bot, FileText } from 'lucide-react';
import { ScreenshotReference } from './ImageDisplay';
import './ChatMessage.css';

export interface Citation {
  title: string;
  url: string;
  content: string;
}

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp?: string;
  onOpenDocument?: (title: string, url: string, content?: string) => void;
}

const enhanceVisualReferences = (text: string) => {
  const stepPattern = /Step \d+/g;
  const visualCues = [
    'screenshot', 'image', 'picture', 'visual', 'see the', 'look for',
    'click on', 'button', 'field', 'menu', 'dialog', 'window'
  ];

  const hasSteps = stepPattern.test(text);
  const hasVisualCues = visualCues.some(cue => text.toLowerCase().includes(cue));

  return { hasSteps, hasVisualCues };
};

function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return <strong key={idx} className="bold-text">{inner}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

export function ChatMessage({ role, content, citations, timestamp, onOpenDocument }: ChatMessageProps) {
  const isUser = role === 'user';
  const { hasSteps, hasVisualCues } = enhanceVisualReferences(content);

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-wrapper">
        <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-sender">
              {isUser ? 'You' : 'IT Support Assistant'}
            </span>
            {timestamp && (
              <span className="message-time">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="message-bubble">
            <div className={`message-text ${isUser ? 'user-text' : 'assistant-text'}`}>
              {renderWithBold(content)}
            </div>
          </div>

          {/* Visual Reference Indicators */}
          {!isUser && (hasSteps || hasVisualCues) && (
            <div className="visual-references">
              {hasSteps && (
                <ScreenshotReference
                  description="This process includes step-by-step screenshots in the source document to guide you visually."
                  className="screenshot-ref"
                />
              )}
              {hasVisualCues && !hasSteps && (
                <ScreenshotReference
                  description="The source document contains visual guides and screenshots to help you identify the correct buttons and interface elements."
                />
              )}
            </div>
          )}

          {citations && citations.length > 0 && (
            <div className="citations">
              <span className="citations-label">Sources:</span>
              {citations.map((citation, index) => (
                <button
                  key={index}
                  onClick={() => onOpenDocument?.(citation.title, citation.url, citation.content)}
                  className="citation-button"
                  title={`View: ${citation.title}`}
                >
                  <FileText size={12} />
                  <span className="citation-title">{citation.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

