import React, { useState } from 'react';
import { X, Ticket, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import './TicketModal.css';

export interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, description: string, userName: string, userEmail: string) => Promise<void>;
  initialDescription?: string;
}

export function TicketModal({ isOpen, onClose, onSubmit, initialDescription = '' }: TicketModalProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketInfo, setTicketInfo] = useState<{ id?: number; url?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setErrorMessage('Please provide a description of your issue');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await onSubmit(
        subject.trim() || 'IT Support Request from Chat',
        description.trim(),
        userName.trim() || 'Unknown User',
        userEmail.trim() || 'unknown@chargerlogistics.com'
      );
      
      setSubmitStatus('success');
      
      // Auto-close after 3 seconds on success
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setDescription('');
    setUserName('');
    setUserEmail('');
    setSubmitStatus('idle');
    setErrorMessage('');
    setTicketInfo({});
    onClose();
  };

  return (
    <div className="ticket-modal-overlay" onClick={handleClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-modal-header">
          <div className="ticket-modal-title">
            <Ticket size={24} />
            <h2>Create Support Ticket</h2>
          </div>
          <button onClick={handleClose} className="close-button" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {submitStatus === 'success' ? (
          <div className="ticket-success">
            <CheckCircle size={48} className="success-icon" />
            <h3>Ticket Created Successfully!</h3>
            <p>You'll receive an email confirmation shortly.</p>
            {ticketInfo.id && (
              <div className="ticket-details">
                <p><strong>Ticket ID:</strong> {ticketInfo.id}</p>
                {ticketInfo.url && (
                  <a href={ticketInfo.url} target="_blank" rel="noopener noreferrer" className="ticket-link">
                    View Ticket
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="userEmail">Your Email</label>
              <input
                id="userEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="john@chargerlogistics.com"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="form-textarea"
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>

            {submitStatus === 'error' && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{errorMessage || 'Failed to create ticket. Please try again.'}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Ticket size={20} />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

