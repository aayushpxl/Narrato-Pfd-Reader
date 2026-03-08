import React, { useState, useEffect, useContext } from 'react';
import { FiBookOpen, FiLogIn, FiMoon, FiSun, FiHeadphones, FiCloud, FiLayout, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
       navigate('/dashboard');
       return;
    }
    const savedTheme = localStorage.getItem('narrato-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('narrato-theme', newTheme);
  };

  const handleFileSelect = (file) => {
    navigate('/reader', { state: { file, isNew: true } });
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* Decorative Blobs */}
      <div className="blob-bg" style={{ top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'var(--accent-glow)' }}></div>
      <div className="blob-bg" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(236, 72, 153, 0.2)' }}></div>

      {/* Header */}
      <header className="header animate-fade-in" style={{ justifyContent: 'space-between' }}>
        <div className="logo">
          <FiBookOpen />
          <span>Narrato</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            className="btn btn-icon" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FiSun size={22} /> : <FiMoon size={22} />}
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiLogIn /> Login</span>
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 2rem' }}>
        
        {/* Hero Section */}
        <section className="animate-fade-in" style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', 
            minHeight: '75vh', justifyContent: 'center', maxWidth: '800px'
        }}>
            <div style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent-primary)' }}>
               ✨ The future of reading is listening
            </div>
            
            <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
               Turn any PDF into an <br /> Interactive Audiobook
            </h1>
            
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2rem' }}>
               Experience your documents like never before. Narrato reads your books aloud while highlighting every word so you never lose your place.
            </p>

            <div className="animate-fade-in delay-200" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 }}>
                   <FileUpload onFileSelect={handleFileSelect} />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section style={{ width: '100%', maxWidth: '960px', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem', textAlign: 'center' }}>Designed for a better reading experience</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', width: '100%' }}>
                
                <div className="feature-card animate-fade-in delay-100">
                    <div className="feature-icon-wrapper"><FiHeadphones size={22} /></div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Listen Along</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.875rem' }}>AI-powered Text-to-Speech narrates your PDFs. Sit back, relax, and absorb information faster.</p>
                </div>

                <div className="feature-card animate-fade-in delay-200">
                    <div className="feature-icon-wrapper"><FiLayout size={22} /></div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Word Highlighting</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.875rem' }}>Words are highlighted exactly as they are spoken, boosting your comprehension effortlessly.</p>
                </div>

                <div className="feature-card animate-fade-in delay-300">
                    <div className="feature-icon-wrapper"><FiCloud size={22} /></div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Cloud Sync</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.875rem' }}>Save your reading progress. Start on your laptop and pick up exactly where you left off.</p>
                </div>

            </div>
        </section>

        {/* How it Works */}
        <section style={{ width: '100%', maxWidth: '800px', padding: '3rem 0 5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>How Narrato works</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flexShrink: 0, width: '32px', height: '32px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>1</div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Drop a PDF</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Simply drag and drop any PDF file into the upload zone above. We process it instantly.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flexShrink: 0, width: '32px', height: '32px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>2</div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Hit Play</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Click the play button in the reader toolbar. The text will be extracted and read aloud to you.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flexShrink: 0, width: '32px', height: '32px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>3</div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Save Your Library</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Sign up for a free account to keep a library of your past reads and never lose your page number.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ width: '100%', padding: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
         <div className="logo" style={{ fontSize: '1.25rem' }}>
            <FiBookOpen /> Narrato
         </div>
         <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} Narrato. All rights reserved.
         </p>
      </footer>

    </div>
  );
};

export default Landing;
