import React from 'react';
import { QuickActions } from './QuickActions';

export interface WelcomeMessageProps {
  onSampleQuestion: (question: string) => void;
}

export function WelcomeMessage({ onSampleQuestion }: WelcomeMessageProps) {
  return (
    <div className="welcome-message">
      <QuickActions onSelectAction={onSampleQuestion} />
    </div>
  );
}

