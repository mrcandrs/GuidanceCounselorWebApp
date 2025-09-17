import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCapsOn, setIsCapsOn] = useState(false);
  const navigate = useNavigate();
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
    const response = await api.post('https://guidanceofficeapi-production.up.railway.app/api/counselor/login', {
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

    const token = response.data.token;
    localStorage.setItem('authToken', token);

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email.trim().toLowerCase());
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    navigate('/dashboard');
  } catch (err) {
    const msg = err?.response?.status === 401
      ? 'Invalid email or password.'
      : 'Unable to sign in. Please try again.';
    setError(msg);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-wrapper">
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
        <h1 className="login-title">STI Tarlac Guidance and Counseling Office</h1>
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
    </div>
  );
};

export default Login;