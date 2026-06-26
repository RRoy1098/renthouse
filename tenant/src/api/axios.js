import axios from 'axios';





export const API_BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_BACKEND_URL_PROD

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tenantToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantUser');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/sign-in') && !window.location.pathname.startsWith('/sign-up')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
