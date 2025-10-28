import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

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
    <div className="fixed bottom-0 w-full flex justify-center p-4 pb-6 z-40">
      <div className="w-full max-w-3xl">
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-full text-red-600 text-sm flex items-center gap-2 shadow-light">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Input Form - Capsule/Pill Shape */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            {/* Textarea container - Pill shaped */}
            <div className="relative bg-white/95 backdrop-blur-xl border-2 border-border-primary focus-within:border-blue-500 rounded-full transition-all duration-200 focus-within:ring-4 focus-within:ring-blue-100 shadow-light-lg hover:shadow-xl">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder="Ask me anything about IT support..."
                rows="1"
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted py-4 pl-6 pr-16 resize-none focus:outline-none text-sm md:text-base rounded-full"
                style={{ maxHeight: '120px' }}
              />

              {/* Send Button */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
          <div className="mt-2 flex items-center justify-between text-xs text-text-muted px-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{inputValue.length} characters</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputArea;

