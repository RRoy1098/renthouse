import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Note: JWT is stored in localStorage for simplicity. In production,
// httpOnly cookies are more secure against XSS attacks, but localStorage
// is chosen here for ease of development and because this is a demo app.
// An httpOnly cookie approach would require a server-side proxy and
// SameSite cookie configuration.

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
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
