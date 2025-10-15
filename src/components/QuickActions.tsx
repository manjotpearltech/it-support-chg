import React from 'react';
import { 
  Smartphone, 
  Phone, 
  Lock, 
  Mail, 
  Wifi, 
  HelpCircle,
  Zap
} from 'lucide-react';
import './QuickActions.css';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  query: string;
  color: string;
}

interface QuickActionsProps {
  onSelectAction: (query: string) => void;
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      icon: <Smartphone className="action-icon" />,
      label: "OpenPath",
      description: "Set up door access",
      query: "I need to set up OpenPath",
      color: "blue"
    },
    {
      icon: <Phone className="action-icon" />,
      label: "CyberGate",
      description: "Video calls & device control",
      query: "How do I use CyberGate?",
      color: "purple"
    },
    {
      icon: <Lock className="action-icon" />,
      label: "Password Reset",
      description: "Reset your password",
      query: "I need to reset my password",
      color: "green"
    },
    {
      icon: <Mail className="action-icon" />,
      label: "Email",
      description: "Fix send/receive issues",
      query: "I'm having email problems",
      color: "orange"
    },
    {
      icon: <Wifi className="action-icon" />,
      label: "Network",
      description: "Fix connection/Wi‑Fi",
      query: "I can't connect to the network",
      color: "red"
    },
    {
      icon: <HelpCircle className="action-icon" />,
      label: "Other",
      description: "Describe your issue",
      query: "",
      color: "gray"
    }
  ];

  return (
    <div className="quick-actions-container">
      {/* Header */}
      <div className="quick-actions-header">
        <div className="header-icon">
          <Zap className="zap-icon" />
        </div>
        <h1 className="header-title">
          How can we help?
        </h1>
        <p className="header-subtitle">
          Pick an action or ask a question
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => action.query && onSelectAction(action.query)}
            className={`action-card ${action.color} ${!action.query ? 'disabled' : ''}`}
            disabled={!action.query}
          >
            <div className="action-icon-wrapper">
              {action.icon}
            </div>

            <h3 className="action-label">
              {action.label}
            </h3>

            <p className="action-description">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="popular-topics">
        <h3 className="topics-title">
          Popular Topics
        </h3>
        <div className="topics-list">
          {[
            "OpenPath",
            "CyberGate",
            "Reset Password",
            "Email",
            "VPN Access",
            "Printers"
          ].map((topic, index) => (
            <button
              key={index}
              onClick={() => onSelectAction(topic)}
              className="topic-button"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

