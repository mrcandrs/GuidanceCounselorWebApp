import axios from 'axios';

const api = axios.create({
  baseURL: 'https://guidanceofficeapi-production.up.railway.app/',
});

export default api;