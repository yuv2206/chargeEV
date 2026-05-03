import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/') && !config.url.startsWith('/api/')) {
    config.url = `/api${config.url}`;
  }

  const userToken = localStorage.getItem('ev_user_token');
  const adminToken = localStorage.getItem('ev_admin_token');
  const token = config.headers['X-Admin-Request'] ? adminToken : userToken || adminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  delete config.headers['X-Admin-Request'];
  return config;
});

export default api;

