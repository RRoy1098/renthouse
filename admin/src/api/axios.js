import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401/403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
