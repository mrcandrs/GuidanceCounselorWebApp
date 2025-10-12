import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, X, ArrowLeft } from 'lucide-react';
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://guidanceofficeapi-production.up.railway.app/api/counselor/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password updated successfully! You can now login with your new password.', 'success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update password');
        showToast(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div 
      className="login-page"
      style={{
        backgroundImage: `url(${typeof window !== 'undefined' ? `${window.location.origin}/sti-college-building.jpg` : ''})`,
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
            />
          </div>
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter your email and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <p className="error-message" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span id="buttonText">{isLoading ? 'Updating Password...' : 'Update Password'}</span>
          </button>

          <button 
            type="button" 
            className="forgot-password"
            onClick={handleBackToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#0477BF',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
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

export default ForgotPassword;
