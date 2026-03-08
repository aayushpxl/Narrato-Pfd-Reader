import React, { useState, useEffect, useContext } from 'react';
import { FiMoon, FiSun, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Reader from '../components/Reader';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ReaderPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Passed file from Dashboard/FileUpload
  const pdfFile = location.state?.file;

  useEffect(() => {
    if (!pdfFile) {
        navigate('/dashboard');
        return;
    }

    const fetchThemeParams = async () => {
      let theme = 'light';
      try {
        if (user) {
          const res = await axios.get(`http://localhost:5000/api/settings/${user._id}`);
          theme = res.data.theme || 'light';
        } else {
          theme = localStorage.getItem('narrato-theme') || 'light';
        }
      } catch (e) {
        theme = localStorage.getItem('narrato-theme') || 'light';
      }

      setIsDarkMode(theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    };

    fetchThemeParams();
  }, [user, pdfFile, navigate]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('narrato-theme', newTheme);

    if (user) {
      try {
        await axios.put(`http://localhost:5000/api/settings/${user._id}`, { theme: newTheme });
      } catch (error) {
         console.error("Could not save theme to backend", error);
      }
    }
  };

  if (!pdfFile) return null;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-icon" title="Back to Dashboard">
            <FiArrowLeft size={20} />
          </button>
          <div className="logo" style={{ fontSize: '1.2rem' }}>
            <FiBookOpen />
            <span>Narrato Reader</span>
          </div>
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
      <main className="main-content" style={{ padding: '1rem' }}>
          <Reader file={pdfFile} isBookMode={false} userId={user ? user._id : 'guest'} />
      </main>
    </div>
  );
};

export default ReaderPage;
