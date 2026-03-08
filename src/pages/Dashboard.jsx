import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiPlus, FiBook, FiClock } from 'react-icons/fi';
import axios from 'axios';
import FileUpload from '../components/FileUpload';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [readingHistory, setReadingHistory] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        // Fetch user's reading history from backend
        const response = await axios.get(`http://localhost:5000/api/settings/${user._id}`);
        if (response.data && response.data.readingProgress) {
          setReadingHistory(response.data.readingProgress);
        }
      } catch (error) {
        console.error("Error fetching history", error);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileSelect = (file) => {
    // Navigate to reader page with the selected file
    // In a real app we'd pass the file object via state or context
    navigate('/reader', { state: { file, isNew: true } });
  };

  const handleResume = (historyItem) => {
    // Navigate to reader page to resume specific file
    // Assumes the file is still accessible or requires re-upload
    alert(`Ready to resume ${historyItem.pdfId} from page ${historyItem.lastPageRead}. Please upload the file again.`);
    setShowUpload(true);
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <header className="header animate-fade-in" style={{ justifyContent: 'space-between' }}>
        <div className="logo">
          <FiBook />
          <span>Narrato Dashboard</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 500 }}>Hello, {user.username}</span>
          <button onClick={handleLogout} className="btn btn-icon" title="Logout">
            <FiLogOut size={20} />
          </button>
        </div>
      </header>

      <main className="main-content" style={{ alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Your Library</h2>
          <button onClick={() => setShowUpload(!showUpload)} className="btn btn-primary">
            <FiPlus /> New Book
          </button>
        </div>

        {showUpload && (
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem', width: '100%' 
        }}>
          {readingHistory.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <FiBook size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>You haven't read any books yet.</p>
              <p>Click "New Book" to start reading.</p>
            </div>
          ) : (
            readingHistory.map((item, index) => (
              <div key={index} className="book-card animate-fade-in" style={{
                background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '1rem'
              }}
              onClick={() => handleResume(item)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    padding: '1rem', background: 'var(--accent-glow)', 
                    borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' 
                  }}>
                    <FiBook size={24} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.pdfId}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      <FiClock /> Page {item.lastPageRead}
                    </div>
                  </div>
                </div>
                
                <button className="btn" style={{ width: '100%', marginTop: 'auto', background: 'var(--bg-primary)' }}>
                  Resume Reading
                </button>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
