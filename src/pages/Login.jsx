import React, { useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import useSessionTimeout from '../hooks/useSessionTimeout';
import { getCurrentSession, storeSessionInfo, generateSessionId } from '../utils/sessionManager';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import '../styles/Login.css';

// Toast Notification Component
const Toast = ({ message, type, onClose, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose, duration]);

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0477BF',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: 'rgba(255, 255, 255, 0.3)',
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}
      />
      
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <AlertTriangle size={20} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const Login = () => {
  const bgUrl = (typeof window !== 'undefined')
    ? `${window.location.origin}/sti-college-building.jpg`
    : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsOn, setIsCapsOn] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);
  const navigate = useNavigate();
  // Reset session timeout on successful login
  const { resetTimeout } = useSessionTimeout(30, 5);
  const passwordInputRef = useRef(null);

  // prefill remembered email
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) setEmail(remembered);
  }, []);

  const handlePasswordKeyUp = (e) => {
  const caps = e.getModifierState && e.getModifierState('CapsLock');
  setIsCapsOn(!!caps);
  };

  const togglePassword = () => {
    const input = passwordInputRef.current;
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  try {
    const baseSession = getCurrentSession();
    // Always use a fresh sessionId on login to avoid reusing an invalidated session
    const freshSessionId = generateSessionId();
    const sessionInfo = { ...baseSession, sessionId: freshSessionId };
    console.log('🔐 Login attempt with session info:', sessionInfo);
    
    const response = await api.post('https://guidanceofficeapi-production.up.railway.app/api/counselor/login', {
      email: email.trim().toLowerCase(),
      password: password.trim(),
      deviceId: sessionInfo.deviceId,
      sessionId: sessionInfo.sessionId
    });

    const token = response.data.token;
    localStorage.setItem('authToken', token);

    // Store session info
    storeSessionInfo(sessionInfo);

    // Invalidate other sessions for this counselor
    try {
      console.log('🔄 Invalidating other sessions...');
      await api.post('https://guidanceofficeapi-production.up.railway.app/api/counselor/invalidate-other-sessions', {
        currentDeviceId: sessionInfo.deviceId,
        currentSessionId: sessionInfo.sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Other sessions invalidated successfully');
    } catch (error) {
      console.warn('Failed to invalidate other sessions:', error);
      // Don't fail login if session invalidation fails
    }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email.trim().toLowerCase());
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    resetTimeout();
    showToast('Login successful!', 'success');
    navigate('/dashboard');
  } catch (err) {
    const msg = err?.response?.status === 401
      ? 'Invalid email or password.'
      : 'Unable to sign in. Please try again.';
    setError(msg);
    showToast(msg, 'error');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div
    className="login-wrapper"
    style={{
      position: 'fixed',
      inset: 0,              // top:0 right:0 bottom:0 left:0
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, rgba(4,119,191,.55) 0%, rgba(3,90,140,.7) 50%, rgba(4,119,191,.8) 100%), url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}
  >
    <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
    </div>

    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <img 
              src="/sti-tarlac-logo.png" 
              alt="STI Tarlac Logo"
              className="logo-img"
            /></div>
        <h1 className="login-title">Guidance and Counseling Office</h1>
        <p className="login-subtitle">Guidance Counselor Web Application</p>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        {error && (
          <p className="error-message" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <div className="form-group">
          <label>Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <span className="input-icon">👤</span>
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              ref={passwordInputRef}
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handlePasswordKeyUp}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-describedby={isCapsOn ? 'caps-hint' : undefined}
            />
            <span className="input-icon">🔒</span>
            <button 
              type="button" 
              className="password-toggle" 
              onClick={togglePassword}
              aria-label="Toggle password visibility"
            >
              👁️
            </button>
              </div>
              {isCapsOn && (
                <small id="caps-hint" className="caps-hint">
                Caps Lock is on
                </small>
            )}
        </div>

          <div className="remember-forgot">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <a className="forgot-password" href="/forgot-password">
            Forgot password?
          </a>
        </div>

        <button 
          type="submit" 
          className={`login-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
          >
          <span id="buttonText">{isLoading ? 'Logging in…' : 'Login'}</span>
        </button>
      </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default Login;