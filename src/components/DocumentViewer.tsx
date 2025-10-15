import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { SecurePdfViewer } from './SecurePdfViewer';
import './DocumentViewer.css';

export interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentUrl: string;
  documentContent?: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  documentTitle,
  documentUrl,
  documentContent
}: DocumentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isOpen, handleKeyDown]);

  const getExtension = (urlOrName: string) => {
    try {
      const u = new URL(urlOrName);
      const last = u.pathname.split('/').pop() || '';
      const idx = last.lastIndexOf('.');
      return idx >= 0 ? last.slice(idx + 1).toLowerCase() : '';
    } catch {
      const last = (urlOrName.split('?')[0].split('#')[0].split('/').pop() || '').trim();
      const idx = last.lastIndexOf('.');
      return idx >= 0 ? last.slice(idx + 1).toLowerCase() : '';
    }
  };

  const previewUrl = documentUrl ? `/api/blob?url=${encodeURIComponent(documentUrl)}` : '';
  const ext = documentUrl ? getExtension(documentUrl || documentTitle) : getExtension(documentTitle);

  useEffect(() => {
    if (isOpen && documentContent && !documentUrl) {
      setContent(documentContent);
      setError(null);
    } else {
      setContent('');
      setError(null);
    }
  }, [isOpen, documentContent, documentUrl]);

  if (!isOpen) return null;

  return (
    <div className="document-viewer">
      {/* Header */}
      <div className="viewer-header">
        <div className="viewer-title-wrapper">
          <FileText className="viewer-icon" />
          <h3 className="viewer-title" title={documentTitle}>
            {documentTitle}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="close-button"
          title="Close document viewer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="viewer-content">
        {error && (
          <div className="viewer-error">
            <div className="error-text">{error}</div>
            {documentUrl && (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                <ExternalLink size={16} />
                Open document externally
              </a>
            )}
          </div>
        )}

        {!error && documentUrl && (
          <div className="document-container">
            {ext === 'pdf' && (
              <SecurePdfViewer src={previewUrl} title={documentTitle} />
            )}
            {['html','htm','txt'].includes(ext) && (
              <iframe
                src={previewUrl}
                title={documentTitle}
                className="document-iframe"
              />
            )}
            {['png','jpg','jpeg','gif','webp','svg'].includes(ext) && (
              <div className="image-container">
                <img
                  src={previewUrl}
                  alt={documentTitle}
                  className="document-image"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            )}
            {!['pdf','html','htm','txt','png','jpg','jpeg','gif','webp','svg'].includes(ext) && (
              <div className="unsupported-format">
                <FileText className="large-icon" />
                <h4>Open Original Document</h4>
                <p>Preview not supported here. Open the original file to see all images and formatting.</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-button"
                >
                  <ExternalLink size={16} />
                  Open Document
                </a>
              </div>
            )}
          </div>
        )}

        {!error && !documentUrl && content && (
          <div className="text-content">
            <pre className="content-text">{content}</pre>
          </div>
        )}

        {!error && !documentUrl && !content && (
          <div className="no-content">
            <FileText className="large-icon" />
            <p>No document content available</p>
          </div>
        )}
      </div>
    </div>
  );
}

