import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default TypingIndicator;

