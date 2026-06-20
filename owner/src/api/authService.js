import api from './axios';

export const ownerAuthService = {
  register: async (userData) => {
    const response = await api.post('/auth/owner/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/owner/login', credentials);
    return response.data;
  },
};
