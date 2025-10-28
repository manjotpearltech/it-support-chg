import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';

const SourceCitations = ({ sources, onSourceClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  /**
   * Handle source click - open in PDF viewer or new tab
   */
  const handleSourceClick = (source) => {
    // Check if we're on mobile (screen width < 768px)
    const isMobile = window.innerWidth < 768;

    if (isMobile || !onSourceClick) {
      // Mobile: open in new tab
      if (source.url) {
        window.open(source.url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Desktop: open in PDF viewer panel
      onSourceClick(source);
    }
  };

  const getRelevanceColor = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-amber-400';
    return 'text-text-muted';
  };

  const getRelevanceBgColor = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-bg-tertiary border-border-primary';
  };

  return (
    <div className="mt-4 border-t border-border-primary pt-4">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-bg-tertiary hover:bg-gray-200 rounded-lg transition-all duration-200 cursor-pointer border border-border-primary"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-text-secondary">
            Sources ({sources.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      {/* Source List - Expandable */}
      {isExpanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {sources.map((source, idx) => {
            const percentage = Math.round(source.score * 100);
            return (
              <div
                key={idx}
                onClick={() => handleSourceClick(source)}
                className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-light-md cursor-pointer ${getRelevanceBgColor(source.score)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-text-primary truncate">
                        {source.filename}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${getRelevanceColor(source.score)}`}>
                        {percentage}% relevance
                      </span>
                    </div>
                  </div>
                  <div className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SourceCitations;

