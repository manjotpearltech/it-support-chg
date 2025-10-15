import React from 'react';
import { Image } from 'lucide-react';
import './ImageDisplay.css';

interface ScreenshotReferenceProps {
  description: string;
  className?: string;
}

export function ScreenshotReference({ description, className = '' }: ScreenshotReferenceProps) {
  return (
    <div className={`screenshot-reference ${className}`}>
      <Image className="screenshot-icon" size={16} />
      <span className="screenshot-text">{description}</span>
    </div>
  );
}

