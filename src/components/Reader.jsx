import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiSquare, FiSettings, FiX, FiBookOpen } from 'react-icons/fi';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PAGE_COLORS = [
  { name: 'White', value: '#ffffff', text: '#1a1a2e' },
  { name: 'Cream', value: '#fdf6e3', text: '#3d3229' },
  { name: 'Sepia', value: '#f4ecd8', text: '#5b4636' },
  { name: 'Mint', value: '#e8f5e9', text: '#1b3a1b' },
  { name: 'Night', value: '#1e293b', text: '#e2e8f0' },
  { name: 'Dark', value: '#111827', text: '#d1d5db' },
];

const FONTS = ['Inter', 'Georgia', 'Merriweather', 'Lora', 'monospace'];

const Reader = ({ file, isBookMode, userId }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [flipState, setFlipState] = useState({ phase: 'idle', direction: null }); // phase: idle | flipping-out | flipping-in
  const [showText, setShowText] = useState(false);
  const flipTimeoutRef = useRef(null);

  // Customization
  const [showPanel, setShowPanel] = useState(true);
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [pageColor, setPageColor] = useState(PAGE_COLORS[1]);

  // TTS
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const renderTaskLeftRef = useRef(null);
  const renderTaskRightRef = useRef(null);

  // Load PDF
  useEffect(() => {
    const load = async () => {
      if (!file) return;
      try {
        const ab = await file.arrayBuffer();
        const loaded = await pdfjsLib.getDocument({ data: ab }).promise;
        setPdf(loaded);
        setNumPages(loaded.numPages);

        try {
          if (!userId || userId === 'guest') { setCurrentPage(1); return; }
          const res = await fetch(`http://localhost:5000/api/settings/${userId}`);
          if (res.ok) {
            const data = await res.json();
            const prog = data.readingProgress?.find(p => p.pdfId === file.name);
            if (prog && prog.lastPageRead <= loaded.numPages) {
              setCurrentPage(prog.lastPageRead);
            } else { setCurrentPage(1); }
          } else { setCurrentPage(1); }
        } catch { setCurrentPage(1); }
      } catch (err) { console.error("Error loading PDF:", err); }
    };
    load();
  }, [file]);

  // Render a single page to a canvas
  const renderSinglePage = useCallback(async (pageNum, canvasRef, taskRef) => {
    if (!pdf || !canvasRef.current) return;
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Render at 2x resolution for crisp text, CSS will scale it down
      const displayWidth = 480;
      const renderScale = 2;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (displayWidth * renderScale) / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // CSS display size — sharp on screen
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${(displayWidth * viewport.height) / viewport.width}px`;

      if (taskRef.current) { taskRef.current.cancel(); }

      const task = page.render({ canvasContext: ctx, viewport });
      taskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err.name !== "RenderingCancelledException") console.error(err);
    }
  }, [pdf]);

  // Render two-page spread + extract text from left page
  useEffect(() => {
    if (!pdf) return;

    const renderSpread = async () => {
      // Left page = currentPage (always odd for proper book feel, but we allow any)
      await renderSinglePage(currentPage, leftCanvasRef, renderTaskLeftRef);

      // Right page = currentPage + 1
      if (currentPage + 1 <= numPages) {
        await renderSinglePage(currentPage + 1, rightCanvasRef, renderTaskRightRef);
      } else if (rightCanvasRef.current) {
        // Clear right canvas if no next page
        const ctx = rightCanvasRef.current.getContext('2d');
        rightCanvasRef.current.width = 960;
        rightCanvasRef.current.height = 1320;
        rightCanvasRef.current.style.width = '480px';
        rightCanvasRef.current.style.height = '660px';
        ctx.clearRect(0, 0, 960, 1320);
      }

      // Extract text from current page for TTS
      try {
        const page = await pdf.getPage(currentPage);
        const tc = await page.getTextContent();
        setPdfTextContent(tc.items.map(i => i.str).join(' '));
      } catch { setPdfTextContent(''); }

      synth.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    renderSpread();

    // Save progress
    const timer = setTimeout(() => {
      if (file && userId && userId !== 'guest') {
        fetch(`http://localhost:5000/api/settings/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readingProgress: { pdfId: file.name, lastPageRead: currentPage } })
        }).catch(() => {});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [pdf, currentPage, numPages, renderSinglePage, file, userId]);

  const changePage = (dir) => {
    if (flipState.phase !== 'idle') return; // prevent double-flip

    const step = 2;
    const next = dir === 'next' ? currentPage + step : currentPage - step;

    if (dir === 'prev' && next < 1) {
      if (currentPage > 1) {
        setFlipState({ phase: 'flipping-out', direction: 'backward' });
        flipTimeoutRef.current = setTimeout(() => {
          setCurrentPage(1);
          setFlipState({ phase: 'flipping-in', direction: 'backward' });
          flipTimeoutRef.current = setTimeout(() => setFlipState({ phase: 'idle', direction: null }), 450);
        }, 500);
      }
      return;
    }
    if (dir === 'next' && next > numPages) return;

    const direction = dir === 'next' ? 'forward' : 'backward';
    setFlipState({ phase: 'flipping-out', direction });

    flipTimeoutRef.current = setTimeout(() => {
      setCurrentPage(next);
      setFlipState({ phase: 'flipping-in', direction });
      flipTimeoutRef.current = setTimeout(() => {
        setFlipState({ phase: 'idle', direction: null });
      }, 450);
    }, 500);
  };

  // Cleanup flip timeouts
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) { synth.pause(); setIsPlaying(false); }
    else {
      if (synth.paused) { synth.resume(); setIsPlaying(true); }
      else {
        const utt = new SpeechSynthesisUtterance(pdfTextContent);
        utt.rate = 1.0;
        utt.onboundary = (e) => { if (e.name === 'word') { setCurrentWordIndex(pdfTextContent.substring(0, e.charIndex).split(/\s+/).length - 1); } };
        utt.onend = () => { setIsPlaying(false); setCurrentWordIndex(-1); };
        utteranceRef.current = utt;
        synth.speak(utt);
        setIsPlaying(true);
        setShowText(true);
      }
    }
  };

  const handleStop = () => { synth.cancel(); setIsPlaying(false); setCurrentWordIndex(-1); };

  useEffect(() => { return () => { synth.cancel(); }; }, [synth]);

  const words = pdfTextContent ? pdfTextContent.split(/\s+/) : [];
  const rightPageNum = currentPage + 1 <= numPages ? currentPage + 1 : null;

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* Main area: book + toolbar + read-along */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto', padding: '1.5rem 1rem', gap: '1rem' }}>

        {/* Book Spread */}
        <div className="book-wrapper" style={{ flexShrink: 0 }}>
          <div
            className={`book-spread${
              flipState.phase === 'flipping-in' && flipState.direction === 'forward' ? ' page-flip-forward-in' :
              flipState.phase === 'flipping-in' && flipState.direction === 'backward' ? ' page-flip-backward-in' : ''
            }${
              flipState.phase === 'flipping-out' && flipState.direction === 'forward' ? ' page-flip-forward-shadow' :
              flipState.phase === 'flipping-out' && flipState.direction === 'backward' ? ' page-flip-backward-shadow' : ''
            }`}
            style={{ background: pageColor.value }}
          >
            {/* Left PDF page */}
            <div
              className={`book-page book-page-left${
                flipState.phase === 'flipping-out' && flipState.direction === 'backward' ? ' page-flip-backward-out' : ''
              }`}
              style={{ background: pageColor.value, padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <canvas ref={leftCanvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '2px' }}></canvas>
              <div style={{ fontSize: '0.65rem', color: pageColor.text, opacity: 0.35, marginTop: '0.5rem' }}>Page {currentPage}</div>
            </div>
            {/* Right PDF page */}
            <div
              className={`book-page book-page-right${
                flipState.phase === 'flipping-out' && flipState.direction === 'forward' ? ' page-flip-forward-out' : ''
              }`}
              style={{ background: pageColor.value, padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {rightPageNum ? (
                <>
                  <canvas ref={rightCanvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '2px' }}></canvas>
                  <div style={{ fontSize: '0.65rem', color: pageColor.text, opacity: 0.35, marginTop: '0.5rem' }}>Page {rightPageNum}</div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3, color: pageColor.text, fontSize: '0.875rem' }}>End of book</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="reader-bottom-bar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => changePage('prev')} disabled={currentPage <= 1} style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}>
            <FiChevronLeft size={20} />
          </button>
          <button className="btn btn-icon" onClick={handlePlayPause} style={{ background: isPlaying ? 'var(--bg-secondary)' : 'var(--accent-primary)', color: isPlaying ? 'var(--text-primary)' : 'white' }}>
            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          <button className="btn btn-icon" onClick={handleStop}><FiSquare size={18} /></button>
          <span style={{ fontWeight: '600', fontSize: '0.8rem', minWidth: '100px', textAlign: 'center' }}>
            {currentPage}{rightPageNum ? `–${rightPageNum}` : ''} / {numPages || '--'}
          </span>
          <button className="btn btn-icon" onClick={() => changePage('next')} disabled={currentPage + 2 > numPages && currentPage >= numPages} style={{ opacity: (currentPage + 2 > numPages && currentPage >= numPages) ? 0.4 : 1 }}>
            <FiChevronRight size={20} />
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
          <button className="btn btn-icon" onClick={() => setShowText(!showText)} title="Toggle Read-Along Text">
            <FiBookOpen size={18} />
          </button>
          <button className="btn btn-icon" onClick={() => setShowPanel(!showPanel)} title="Toggle Customize Panel">
            <FiSettings size={18} />
          </button>
        </div>

        {/* Read-Along Text (collapsible) */}
        {showText && (
          <div className="animate-fade-in" style={{
            width: '100%', maxWidth: '800px', flexShrink: 0,
            background: pageColor.value, color: pageColor.text,
            fontFamily, fontSize: `${fontSize}px`, lineHeight,
            padding: '1.5rem', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)',
            maxHeight: '250px', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>Read Along — Page {currentPage}</span>
              <button className="btn btn-icon" onClick={() => setShowText(false)} style={{ padding: '0.25rem' }}><FiX size={14} /></button>
            </div>
            {words.length > 0 ? (
              <p>{words.map((word, i) => (
                <span key={i} style={{
                  backgroundColor: i === currentWordIndex ? 'var(--accent-glow)' : 'transparent',
                  color: i === currentWordIndex ? 'var(--accent-primary)' : pageColor.text,
                  borderRadius: '3px', padding: '0 1px', transition: 'background-color 0.1s ease'
                }}>{word}{' '}</span>
              ))}</p>
            ) : (
              <p style={{ opacity: 0.4 }}>Extracting text...</p>
            )}
          </div>
        )}

      </div>

      {/* Right Sidebar — togglable */}
      <aside style={{
        width: showPanel ? '260px' : '0px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderLeft: showPanel ? '1px solid var(--border-color)' : 'none',
        padding: showPanel ? '1.25rem' : '0',
        overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '0',
        transition: 'width 0.3s ease, padding 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', minWidth: '210px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiSettings size={16} /> Customize</span>
          </h3>
          <button className="btn btn-icon" onClick={() => setShowPanel(false)} style={{ padding: '0.25rem' }}><FiX size={16} /></button>
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
              <div key={c.name} className={`color-swatch ${pageColor.name === c.name ? 'active' : ''}`}
                style={{ backgroundColor: c.value, border: c.value === '#ffffff' ? '2px solid #e2e8f0' : undefined }}
                onClick={() => setPageColor(c)} title={c.name} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          {file?.name || 'No file loaded'}
        </div>
      </aside>

    </div>
  );
};

export default Reader;

