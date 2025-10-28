import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'pdf-viewer-panel-width';
const DEFAULT_WIDTH = 40; // 40% of screen
const MIN_WIDTH = 25; // 25% minimum
const MAX_WIDTH = 70; // 70% maximum

/**
 * Custom hook for managing resizable panel
 * Handles drag-to-resize with localStorage persistence
 */
export const useResizable = () => {
  // Load saved width from localStorage or use default
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_WIDTH;
  });

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  /**
   * Start dragging
   */
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
  }, [panelWidth]);

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const containerWidth = window.innerWidth;
    const deltaX = startXRef.current - e.clientX; // Reversed because panel is on right
    const deltaPercent = (deltaX / containerWidth) * 100;
    const newWidth = startWidthRef.current + deltaPercent;

    // Clamp between min and max
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    setPanelWidth(clampedWidth);
  }, [isDragging]);

  /**
   * Stop dragging and save to localStorage
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, panelWidth.toString());
    }
  }, [isDragging, panelWidth]);

  /**
   * Reset to default width
   */
  const resetWidth = useCallback(() => {
    setPanelWidth(DEFAULT_WIDTH);
    localStorage.setItem(STORAGE_KEY, DEFAULT_WIDTH.toString());
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    panelWidth,
    isDragging,
    handleMouseDown,
    resetWidth,
  };
};

