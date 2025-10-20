import React, { useState } from 'react';
import { Mail, X, Loader2 } from 'lucide-react';
import './EmailPromptModal.css';

interface EmailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string) => Promise<void>;
}

export function EmailPromptModal({ isOpen, onClose, onSubmit }: EmailPromptModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email, name);
      setEmail('');
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="email-modal-header">
          <div className="email-modal-title">
            <Mail size={24} />
            <h2>Create Support Ticket</h2>
          </div>
          <button onClick={onClose} className="close-button" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="email-modal-content">
          <p className="email-modal-description">
            We'll create a support ticket with your conversation history and send you updates via email.
          </p>

          <form onSubmit={handleSubmit} className="email-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@chargerlogistics.com"
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="error-banner">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Creating Ticket...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

