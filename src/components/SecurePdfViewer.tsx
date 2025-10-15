import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import './SecurePdfViewer.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SecurePdfViewerProps {
  src: string;
  title?: string;
}

export function SecurePdfViewer({ src, title }: SecurePdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument(src);
        const pdfDoc = await loadingTask.promise;

        if (isMounted) {
          setPdf(pdfDoc);
          setTotalPages(pdfDoc.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Failed to load PDF document');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [src]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page');
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  if (loading) {
    return (
      <div className="pdf-loading">
        <div className="loading-spinner"></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="secure-pdf-viewer" ref={containerRef}>
      {/* Controls */}
      <div className="pdf-controls">
        <div className="page-controls">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="control-button"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="control-button"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="zoom-controls">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="control-button"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="zoom-info">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="control-button"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="pdf-canvas-container">
        <canvas
          ref={canvasRef}
          className="pdf-canvas"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

