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
        <div classname="login-header">
            <div classname="logo">🎓</div>
            <h1 class="login-title">Guidance Portal</h1>
            <p class="login-subtitle">Counselor Access Dashboard</p>
        </div>

      <form onSubmit={handleLogin} className="login-form">

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="form-group">
          <label>Email</label>
          <div style="position: relative;">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <span class="input-icon">👤</span>
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
          <span class="input-icon">🔒</span>
          <button type="button" class="password-toggle" onclick="togglePassword()">👁️</button>
          </div>
        </div>

        <button type="submit" className="login-btn">
          <span class="loading-spinner" id="loadingSpinner"></span>
          <span id="buttonText">Login</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
