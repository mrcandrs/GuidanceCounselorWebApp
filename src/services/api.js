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
    const status = err?.response?.status;
    const isUnauthorized = status === 401;

    // Where we are in the app
    const isOnLoginPage = window.location.pathname === '/login';

    // Which endpoint failed
    const reqUrl = (err?.config?.url || '').toLowerCase();
    const isLoginRequest = reqUrl.endsWith('/counselor/login') || reqUrl.includes('/counselor/login');

    if (isUnauthorized) {
      // If the 401 is from login (bad creds) or we’re already on login, let the page show the inline error
      if (isOnLoginPage || isLoginRequest) {
        return Promise.reject(err);
      }

      // For protected routes, drop token and send to login
      localStorage.removeItem('authToken');
      window.location.assign('/login'); // use '/login' instead of '/'
    }
    return Promise.reject(err);
  }
);

export default api;
