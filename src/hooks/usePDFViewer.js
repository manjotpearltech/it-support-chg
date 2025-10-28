import { useState, useCallback } from 'react';

/**
 * Custom hook for managing PDF viewer state
 * Handles opening/closing PDF panel and tracking current PDF
 */
export const usePDFViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPDF, setCurrentPDF] = useState(null);

  /**
   * Open PDF viewer with specified PDF
   * @param {Object} pdf - PDF object with url, filename, score
   */
  const openPDF = useCallback((pdf) => {
    if (!pdf || !pdf.url) {
      console.error('Invalid PDF object:', pdf);
      return;
    }
    
    setCurrentPDF(pdf);
    setIsOpen(true);
  }, []);

  /**
   * Close PDF viewer
   */
  const closePDF = useCallback(() => {
    setIsOpen(false);
    // Keep currentPDF for a moment to allow smooth close animation
    setTimeout(() => setCurrentPDF(null), 300);
  }, []);

  /**
   * Toggle PDF viewer
   */
  const togglePDF = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    currentPDF,
    openPDF,
    closePDF,
    togglePDF,
  };
};

