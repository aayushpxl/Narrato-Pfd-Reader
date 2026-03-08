import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Reader = ({ file, isBookMode }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfTextContent, setPdfTextContent] = useState('');
  
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load the document
  useEffect(() => {
    const loadPdf = async () => {
      if (!file) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const loadedPdf = await loadingTask.promise;
        
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1); // Reset to first page on new file
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();
  }, [file]);

  // Render the current page
  const renderPage = useCallback(async (pageNum) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Adjust scale based on window size to make it responsive
      const viewport = page.getViewport({ scale: 1.5 });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Cancel previous render task if still running
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      // Extract text content for TTS (Future phase)
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map(item => item.str).join(' ');
      setPdfTextContent(textItems);

    } catch (error) {
      if (error.name !== "RenderingCancelledException") {
        console.error("Error rendering page:", error);
      }
    }
  }, [pdf]);

  // Re-render when page changes
  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, renderPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="reader-container animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem'
    }}>
      
      <div className="reader-toolbar" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        width: '100%', maxWidth: '800px', padding: '1rem', 
        background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <button 
          className="btn" 
          onClick={handlePrevPage} 
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
        >
          <FiChevronLeft size={24} /> Previous
        </button>
        
        <span style={{ fontWeight: '600' }}>
          Page {currentPage} of {numPages || '--'}
        </span>
        
        <button 
          className="btn" 
          onClick={handleNextPage} 
          disabled={currentPage >= numPages}
          style={{ opacity: currentPage >= numPages ? 0.5 : 1 }}
        >
          Next <FiChevronRight size={24} />
        </button>
      </div>

      <div className="canvas-wrapper" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        maxWidth: '100%',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {/* Normal Mode Canvas */}
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></canvas>
      </div>
      
    </div>
  );
};

export default Reader;
