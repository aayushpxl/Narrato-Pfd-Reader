import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiSquare, FiSettings, FiX } from 'react-icons/fi';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PAGE_COLORS = [
  { name: 'White', value: '#ffffff', text: '#1a1a2e' },
  { name: 'Cream', value: '#fdf6e3', text: '#3d3229' },
  { name: 'Sepia', value: '#f4ecd8', text: '#5b4636' },
  { name: 'Mint', value: '#e8f5e9', text: '#1b3a1b' },
  { name: 'Night', value: '#1e293b', text: '#e2e8f0' },
  { name: 'Dark', value: '#111827', text: '#d1d5db' },
];

const FONTS = [
  'Inter', 'Georgia', 'Merriweather', 'Lora', 'monospace'
];

const Reader = ({ file, isBookMode, userId }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [pageAnim, setPageAnim] = useState('');

  // Customization state
  const [showPanel, setShowPanel] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [pageColor, setPageColor] = useState(PAGE_COLORS[1]); // Cream default

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load the document and previous reading progress
  useEffect(() => {
    const loadPdfAndProgress = async () => {
      if (!file) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);

        try {
          if (!userId || userId === 'guest') {
            setCurrentPage(1);
            return;
          }
          const response = await fetch(`http://localhost:5000/api/settings/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const progress = data.readingProgress?.find(p => p.pdfId === file.name);
            if (progress && progress.lastPageRead <= loadedPdf.numPages) {
              setCurrentPage(progress.lastPageRead);
            } else { setCurrentPage(1); }
          } else { setCurrentPage(1); }
        } catch (apiError) {
          console.error("Could not fetch progress:", apiError);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };
    loadPdfAndProgress();
  }, [file]);

  // Render the current page to hidden canvas
  const renderPage = useCallback(async (pageNum) => {
    if (!pdf || !canvasRef.current) return;
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      const renderTask = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      const textContent = await page.getTextContent();
      const textItems = textContent.items.map(item => item.str).join(' ');
      setPdfTextContent(textItems);

      synth.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    } catch (error) {
      if (error.name !== "RenderingCancelledException") {
        console.error("Error rendering page:", error);
      }
    }
  }, [pdf]);

  const saveReadingProgress = async (page) => {
    try {
      if (!file || !userId || userId === 'guest') return;
      await fetch(`http://localhost:5000/api/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingProgress: { pdfId: file.name, lastPageRead: page } })
      });
    } catch (error) {
      console.error("Could not save reading progress", error);
    }
  };

  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
      const timer = setTimeout(() => { saveReadingProgress(currentPage); }, 500);
      return () => clearTimeout(timer);
    }
  }, [pdf, currentPage, renderPage, file]);

  const changePage = (direction) => {
    const nextPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (nextPage < 1 || nextPage > numPages) return;

    setPageAnim('page-turning-out');
    setTimeout(() => {
      setCurrentPage(nextPage);
      setPageAnim('page-turning-in');
      setTimeout(() => setPageAnim(''), 350);
    }, 300);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
        setIsPlaying(true);
      } else {
        const utterance = new SpeechSynthesisUtterance(pdfTextContent);
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

  useEffect(() => {
    return () => { synth.cancel(); };
  }, [synth]);

  const words = pdfTextContent ? pdfTextContent.split(/\s+/) : [];

  return (
    <div className="reader-container animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem'
    }}>

      {/* Hidden canvas for PDF rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Book Spread */}
      <div className="book-wrapper">
        <div className="book-spread" style={{ background: pageColor.value }}>

          {/* Left page: rendered PDF image */}
          <div className={`book-page book-page-left ${pageAnim}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '1rem', background: pageColor.value }}>
            <canvas ref={(el) => {
              // Copy the hidden canvas image to this visible one
              if (el && canvasRef.current && canvasRef.current.width > 0) {
                const ctx = el.getContext('2d');
                const src = canvasRef.current;
                // Scale to fit the page
                const maxW = 360;
                const ratio = src.height / src.width;
                el.width = maxW;
                el.height = maxW * ratio;
                ctx.drawImage(src, 0, 0, el.width, el.height);
              }
            }} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}></canvas>
          </div>

          {/* Right page: read-along text */}
          <div className={`book-page book-page-right ${pageAnim}`} style={{
            color: pageColor.text,
            fontFamily: fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            background: pageColor.value
          }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: pageColor.text, opacity: 0.4, marginBottom: '1rem' }}>
              Page {currentPage} of {numPages || '--'}
            </div>

            {words.length > 0 ? (
              <p>
                {words.map((word, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: index === currentWordIndex ? 'var(--accent-glow)' : 'transparent',
                      color: index === currentWordIndex ? 'var(--accent-primary)' : pageColor.text,
                      borderRadius: '3px',
                      padding: '0 1px',
                      transition: 'background-color 0.1s ease',
                      display: 'inline'
                    }}
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            ) : (
              <p style={{ opacity: 0.4 }}>Extracting text...</p>
            )}
          </div>

        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="reader-bottom-bar">
        <button className="btn btn-icon" onClick={() => changePage('prev')} disabled={currentPage <= 1} style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}>
          <FiChevronLeft size={20} />
        </button>

        <button className="btn btn-icon" onClick={handlePlayPause} style={{ background: isPlaying ? 'var(--bg-secondary)' : 'var(--accent-primary)', color: isPlaying ? 'var(--text-primary)' : 'white' }}>
          {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
        </button>
        <button className="btn btn-icon" onClick={handleStop}>
          <FiSquare size={18} />
        </button>

        <span style={{ fontWeight: '600', fontSize: '0.8rem', minWidth: '80px', textAlign: 'center' }}>
          {currentPage} / {numPages || '--'}
        </span>

        <button className="btn btn-icon" onClick={() => changePage('next')} disabled={currentPage >= numPages} style={{ opacity: currentPage >= numPages ? 0.4 : 1 }}>
          <FiChevronRight size={20} />
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>

        <button className="btn btn-icon" onClick={() => setShowPanel(!showPanel)} title="Customize">
          <FiSettings size={18} />
        </button>
      </div>

      {/* Customization Panel */}
      <div className={`customize-panel ${showPanel ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Customize Reader</h3>
          <button className="btn btn-icon" onClick={() => setShowPanel(false)}><FiX size={18} /></button>
        </div>

        <div className="ctrl-group">
          <label>Font Family</label>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="ctrl-group">
          <label>Font Size</label>
          <input type="range" min="12" max="28" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
          <div className="ctrl-value">{fontSize}px</div>
        </div>

        <div className="ctrl-group">
          <label>Line Height</label>
          <input type="range" min="1.2" max="2.5" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} />
          <div className="ctrl-value">{lineHeight}</div>
        </div>

        <div className="ctrl-group">
          <label>Page Color</label>
          <div className="color-swatches">
            {PAGE_COLORS.map((c) => (
              <div
                key={c.name}
                className={`color-swatch ${pageColor.name === c.name ? 'active' : ''}`}
                style={{ backgroundColor: c.value, border: c.value === '#ffffff' ? '2px solid #e2e8f0' : undefined }}
                onClick={() => setPageColor(c)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reader;
