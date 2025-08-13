// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://guidanceofficeapi-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // must match your login storage key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Auto-logout if token is invalid/expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
