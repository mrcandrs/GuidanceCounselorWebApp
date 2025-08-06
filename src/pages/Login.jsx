import React, { useState } from 'react';
import api from '../services/api'; //axios instance
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css';

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
      <form onSubmit={handleLogin} className="login-form">
        <h2>Counselor Login</h2>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default Login;
