import React from 'react';
import { Bot, Lock, Mail, Wifi, HelpCircle } from 'lucide-react';

const WelcomeScreen = ({ onExampleClick }) => {
  const suggestedPrompts = [
    {
      icon: <Lock className="w-5 h-5" />,
      text: "How do I reset my Okta password?",
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      text: "VPN connection troubleshooting",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: "Setup email on mobile device",
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      text: "Request new software installation",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6 inline-block animate-bounce-slow">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-glow-blue">
            <Bot className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Hello! I'm your IT Assistant
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Ask me anything about IT procedures, SOPs, and technical support
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="w-full max-w-4xl">
        <h2 className="text-sm font-semibold text-text-secondary mb-4 px-2">
          Suggested prompts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(prompt.text)}
              className="group bg-white hover:bg-bg-tertiary border border-border-primary hover:border-blue-500 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:scale-105 shadow-light hover:shadow-light-md"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {prompt.icon}
                </div>
                <p className="text-text-primary text-sm font-medium flex-1 pt-2">
                  {prompt.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

