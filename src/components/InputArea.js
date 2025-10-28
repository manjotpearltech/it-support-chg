import React, { useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

const InputArea = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  isStreaming, 
  onCancelStreaming,
  error 
}) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120); // Max 5 rows
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [inputValue]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    onSendMessage(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-border-primary p-4 shadow-light-lg z-40">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="font-medium">AI is responding...</span>
            </div>
            <button
              onClick={onCancelStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs text-red-600 hover:text-red-700 transition-all duration-200"
            >
              <Square className="w-3 h-3" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>

            {/* Textarea container */}
            <div className="relative bg-white border-2 border-border-primary focus-within:border-blue-500 rounded-2xl transition-all duration-200 focus-within:ring-4 focus-within:ring-blue-100 shadow-light">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder="Ask me anything about IT support..."
                rows="1"
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted p-4 pr-14 resize-none focus:outline-none text-sm md:text-base"
                style={{ maxHeight: '120px' }}
              />

              {/* Send Button */}
              <div className="absolute right-2 bottom-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isStreaming}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    inputValue.trim() && !isStreaming
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-glow-blue hover:scale-105 cursor-pointer'
                      : 'bg-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  title={isStreaming ? 'AI is responding...' : 'Send message (Enter)'}
                >
                  <Send className={`w-5 h-5 ${inputValue.trim() && !isStreaming ? 'text-white' : 'text-text-muted'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Character count and hints */}
          <div className="mt-2 flex items-center justify-between text-xs text-text-muted px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{inputValue.length} characters</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputArea;

