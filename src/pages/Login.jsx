import React, { useState } from 'react';
import api from '../services/api'; //axios instance
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('https://guidanceofficeapi-production.up.railway.app/api/counselor/login', {
        email,
        password
      });

      const token = response.data.token;

      localStorage.setItem('authToken', token); // Store the token
      navigate('/dashboard'); // Go to dashboard after login
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-container">
        <div className="login-header">
            <div className="logo">🎓</div>
            <h1 className="login-title">Guidance Portal</h1>
            <p className="login-subtitle">Counselor Access Dashboard</p>
        </div>

      <form onSubmit={handleLogin} className="login-form">

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="form-group">
          <label>Email</label>
          <div style={{ position: "relative"}}>
          <input
            type="email"
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
          <div style="position: relative;">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <span className="input-icon">🔒</span>
          <button type="button" className="password-toggle" onClick={togglePassword}>👁️</button>
          </div>
        </div>

        <button type="submit" className="login-btn">
          <span className="loading-spinner" id="loadingSpinner"></span>
          <span id="buttonText">Login</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
