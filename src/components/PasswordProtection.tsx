import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import './PasswordProtection.css';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

export function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '121') {
      onAuthenticated();
      // Store authentication in sessionStorage
      sessionStorage.setItem('authenticated', 'true');
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="password-protection-overlay">
      <div className="password-protection-container">
        <div className="password-header">
          <div className="lock-icon-wrapper">
            <Lock size={48} />
          </div>
          <h1>Charger Logistics IT Support</h1>
          <p>Enter password to access</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`password-input ${error ? 'error' : ''}`}
            autoFocus
          />
          
          {error && (
            <p className="error-text">Incorrect password. Please try again.</p>
          )}

          <button type="submit" className="password-submit">
            Access Support
          </button>
        </form>

        <p className="password-hint">
          Contact IT if you don't have access
        </p>
      </div>
    </div>
  );
}

