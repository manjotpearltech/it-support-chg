import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDF Viewer Panel Component
 * Displays PDF with controls for navigation, zoom, and download
 */
const PDFViewerPanel = ({ pdf, onClose, width }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Handle successful PDF load
   */
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  /**
   * Handle PDF load error
   */
  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL:', pdf?.url);

    // Check if it's an access/authentication error (expired signed URL)
    const errorMessage = error?.message || String(error);

    if (errorMessage.includes('403') || errorMessage.includes('401') || errorMessage.includes('Forbidden')) {
      setError('PDF access expired. Please send a new message to refresh the document.');
    } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      setError('PDF not found. The document may have been removed.');
    } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
      setError('CORS error. Please check worker configuration.');
    } else {
      setError(`Failed to load PDF: ${errorMessage}`);
    }

    setLoading(false);
  };

  /**
   * Navigate to previous page
   */
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  /**
   * Navigate to next page
   */
  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  /**
   * Zoom in
   */
  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.2));
  };

  /**
   * Zoom out
   */
  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  /**
   * Disable right-click context menu to prevent download
   */
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  /**
   * Disable keyboard shortcuts for printing (Cmd+P / Ctrl+P)
   */
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Cmd+P (Mac) or Ctrl+P (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  if (!pdf) return null;

  return (
    <div
      className="h-screen bg-white border-l border-border-primary flex flex-col shadow-light-lg animate-slide-in-right"
      style={{ width: `${width}%` }}
      onContextMenu={handleContextMenu}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-border-primary p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {pdf.filename || 'Document'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors flex-shrink-0"
            title="Close PDF viewer"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {loading ? '...' : `${pageNumber} / ${numPages}`}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Security Notice - No Download/Print */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <span className="hidden sm:inline">🔒 View Only</span>
            <span className="sm:hidden">🔒</span>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-bg-secondary p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-text-secondary">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex justify-center">
            <Document
              file={pdf.url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-light-lg select-none"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Footer - Relevance Score */}
      {pdf.score && (
        <div className="flex-shrink-0 bg-white border-t border-border-primary p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Relevance Score:</span>
            <span className={`font-semibold ${
              pdf.score >= 0.8 ? 'text-green-600' :
              pdf.score >= 0.6 ? 'text-blue-600' :
              pdf.score >= 0.4 ? 'text-amber-600' :
              'text-text-muted'
            }`}>
              {Math.round(pdf.score * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewerPanel;

