import React from 'react';
import { User, Bot, Copy, RefreshCw } from 'lucide-react';
import SourceCitations from './SourceCitations';

const MessageBubble = ({ message, formatTime }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Render message content with bold formatting and line breaks
  const renderMessageContent = (content) => {
    if (!content) return '';

    // Split by ** markers and wrap bold text in <strong> tags
    const parts = content.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and wrap in strong tag
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`max-w-[85%] md:max-w-[80%] ${isUser ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-glow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-xs font-semibold text-text-secondary">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-text-muted">
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-text-secondary" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-light-md'
              : 'bg-white border border-border-primary rounded-bl-sm shadow-light-md'
          }`}
        >
          {/* Message text - show empty state with minimal indicator if no content yet */}
          {isAssistant && !message.content && !message.isComplete ? (
            <div className="text-sm text-text-muted italic">
              Thinking...
            </div>
          ) : (
            <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-text-primary'}`}>
              {isAssistant ? renderMessageContent(message.content) : message.content}
            </div>
          )}

          {/* Source Citations */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <SourceCitations sources={message.sources} />
          )}

          {/* Message Actions - Show on hover for completed assistant messages */}
          {isAssistant && message.isComplete && !message.isError && (
            <div className="mt-3 pt-3 border-t border-border-primary flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-gray-200 border border-border-primary rounded-lg text-xs text-text-secondary hover:text-text-primary transition-all duration-200"
                title="Copy to clipboard"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-gray-200 border border-border-primary rounded-lg text-xs text-text-secondary hover:text-text-primary transition-all duration-200"
                title="Regenerate response"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>
          )}

          {/* Error state */}
          {message.isError && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ An error occurred
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

