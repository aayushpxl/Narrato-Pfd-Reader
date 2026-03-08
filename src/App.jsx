import React, { useState, useEffect } from 'react';
import { FiMoon, FiSun, FiBookOpen } from 'react-icons/fi';
import FileUpload from './components/FileUpload';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // Default user ID for demonstration (In a real app, use authentication)
  const userId = 'user_123';

  // Initialize theme from backend or system preference
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/settings/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsDarkMode(data.theme === 'dark');
          document.documentElement.setAttribute('data-theme', data.theme);
        }
      } catch (error) {
        console.error("Could not fetch settings. Falling back to local preference.", error);
        const savedTheme = localStorage.getItem('narrato-theme');
        if (savedTheme === 'dark') {
          setIsDarkMode(true);
          document.documentElement.setAttribute('data-theme', 'dark');
        } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setIsDarkMode(true);
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      }
    };
    
    fetchSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('narrato-theme', newTheme);

    // Save preference to backend
    try {
      await fetch(`http://localhost:5000/api/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
       console.error("Could not save settings to backend.", error);
    }
  };

  const handleFileSelect = (file) => {
    setPdfFile(file);
    // Future step: Initialize PDF Reading Here
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header animate-fade-in">
        <div className="logo">
          <FiBookOpen />
          <span>Narrato</span>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-icon" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {!pdfFile ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h2>PDF Loaded Successfully</h2>
            <p>Ready to render reader interface...</p>
            {/* Future step: Render PDF Reader Component Here */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
