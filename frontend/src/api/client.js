import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
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

