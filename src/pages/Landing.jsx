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
      <header className="header animate-fade-in" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(var(--bg-primary-rgb), 0.8)' }}>
        <div className="logo" style={{ fontSize: '1.75rem' }}>
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
            minHeight: '80vh', justifyContent: 'center', maxWidth: '1000px', marginTop: '-4rem' 
        }}>
            <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent-primary)' }}>
               ✨ The future of reading is listening
            </div>
            
            <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: 1.1, fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
               Turn any PDF into an <br /> Interactive Audiobook
            </h1>
            
            <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: 1.6, marginBottom: '3rem' }}>
               Experience your documents like never before. Narrato uses advanced Text-to-Speech to read your books aloud while highlighting every word so you never lose your place.
            </p>

            <div className="animate-fade-in delay-200" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '700px', position: 'relative', zIndex: 10 }}>
                   <FileUpload onFileSelect={handleFileSelect} />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section style={{ width: '100%', maxWidth: '1200px', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4rem', textAlign: 'center' }}>Designed for a better reading experience</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
                
                <div className="feature-card animate-fade-in delay-100">
                    <div className="feature-icon-wrapper"><FiHeadphones size={28} /></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Listen Along</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Our AI-powered Text-to-Speech engine beautifully narrates your PDFs. Sit back, relax, and absorb information faster.</p>
                </div>

                <div className="feature-card animate-fade-in delay-200">
                    <div className="feature-icon-wrapper"><FiLayout size={28} /></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Word Highlighting</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Follow along effortlessly. Words are highlighted on the screen exactly as they are spoken, boosting your comprehension.</p>
                </div>

                <div className="feature-card animate-fade-in delay-300">
                    <div className="feature-icon-wrapper"><FiCloud size={28} /></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Cloud Sync</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Create an account to save your reading progress. Start on your laptop and pick up exactly where you left off later.</p>
                </div>

            </div>
        </section>

        {/* How it Works */}
        <section style={{ width: '100%', maxWidth: '1000px', padding: '6rem 0' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '4rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>How Narrato works</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>1</div>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drop a PDF</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Simply drag and drop any PDF file into the upload zone above. We process it instantly.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>2</div>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hit Play</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Click the play button in the reader toolbar. The text will be extracted and read aloud to you.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>3</div>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Save Your Library</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Sign up for a free account to keep a library of your past reads and never lose your page number.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ width: '100%', padding: '3rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', marginTop: 'auto' }}>
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
