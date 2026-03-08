import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiSquare } from 'react-icons/fi';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Reader = ({ file, isBookMode }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfTextContent, setPdfTextContent] = useState('');
  
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  
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
      
      // Extract text content for TTS
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map(item => item.str).join(' ');
      setPdfTextContent(textItems);
      
      // Stop any ongoing speech when a new page renders
      synth.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(-1);

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

  const handlePlayPause = () => {
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
        setIsPlaying(true);
      } else {
        // Start from beginning of page
        const utterance = new SpeechSynthesisUtterance(pdfTextContent);
        // We will fetch user's preferred voice/rate here later
        utterance.rate = 1.0; 
        
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const subStr = pdfTextContent.substring(0, event.charIndex);
            const wordIndex = subStr.split(/\s+/).length - 1;
            setCurrentWordIndex(wordIndex);
          }
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
          // Auto-advance to next page could go here
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    synth.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, [synth]);

  return (
    <div className="reader-container animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem'
    }}>
      
      {/* Playback Controls */}
      <div className="playback-toolbar" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
        padding: '1rem 2rem', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)', marginBottom: '-0.5rem'
      }}>
        <button className="btn btn-icon" onClick={handlePlayPause} style={{ 
          background: isPlaying ? 'var(--bg-secondary)' : 'var(--accent-primary)',
          color: isPlaying ? 'var(--text-primary)' : 'white'
        }}>
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </button>
        <button className="btn btn-icon" onClick={handleStop}>
          <FiSquare size={20} />
        </button>
      </div>

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

      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1200px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="canvas-wrapper" style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '1rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          maxWidth: '100%',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          flex: '1 1 600px'
        }}>
          {/* Normal Mode Canvas */}
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></canvas>
        </div>

        {/* Read-Along Text Box */}
        <div className="read-along-box" style={{
          flex: '1 1 400px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontSize: '1.2rem',
          lineHeight: '1.8'
        }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Read Along</h3>
          {pdfTextContent ? (
            <p>
              {pdfTextContent.split(/\s+/).map((word, index) => (
                <span 
                  key={index} 
                  style={{ 
                    backgroundColor: index === currentWordIndex ? 'var(--accent-glow)' : 'transparent',
                    color: index === currentWordIndex ? 'var(--accent-hover)' : 'inherit',
                    borderRadius: '4px',
                    padding: '0 2px',
                    transition: 'background-color 0.1s ease',
                    display: 'inline-block'
                  }}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Extracting text...</p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Reader;
