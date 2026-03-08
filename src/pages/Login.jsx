import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBookOpen } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.username, formData.email, formData.password);
    }

    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <div className="auth-card animate-fade-in" style={{
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
        padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px', textAlign: 'center'
      }}>
        
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
          <FiBookOpen />
          <span>Narrato</span>
        </div>

        <h2 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
            padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              value={formData.username} 
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', outline: 'none'
              }}
            />
          )}
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ 
              background: 'none', border: 'none', color: 'var(--accent-primary)', 
              cursor: 'pointer', fontWeight: '500', padding: 0 
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
