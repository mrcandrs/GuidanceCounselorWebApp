import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // you stored this after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;