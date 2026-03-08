import React, { useState, useEffect, useContext } from 'react';
import { FiBookOpen, FiLogIn, FiMoon, FiSun } from 'react-icons/fi';
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
    // Navigate straight to the reader page even if not logged in
    navigate('/reader', { state: { file, isNew: true } });
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in" style={{ justifyContent: 'space-between' }}>
        <div className="logo">
          <FiBookOpen />
          <span>Narrato</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-icon" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiLogIn /> Login or Sign Up
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
         <div className="animate-fade-in" style={{ maxWidth: '800px', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               Your Books, Brought to Life
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
               Upload any PDF and turn it into an interactive audiobook immediately. 
               Create an account to save your reading progress and history!
            </p>
         </div>

         <div style={{ width: '100%', maxWidth: '800px' }}>
            <FileUpload onFileSelect={handleFileSelect} />
         </div>
      </main>
    </div>
  );
};

export default Landing;
