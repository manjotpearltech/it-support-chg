import React from 'react';
import { Sparkles, Plus, Settings } from 'lucide-react';

const Header = ({ onNewChat, showHeader }) => {
  if (!showHeader) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-border-primary px-6 py-4 shadow-light">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow-blue hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IT Support AI
            </h1>
            <p className="text-xs text-text-secondary">AI-Powered Assistant</p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-gray-200 border border-border-primary hover:border-blue-500 rounded-xl transition-all duration-200 text-sm font-medium text-text-primary shadow-sm"
            title="Start new chat"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          <button
            className="p-2 bg-bg-tertiary hover:bg-gray-200 border border-border-primary hover:border-blue-500 rounded-xl transition-all duration-200 shadow-sm"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

