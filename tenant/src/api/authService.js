import api from './axios';

export const tenantAuthService = {
  register: async (userData) => {
    const response = await api.post('/auth/tenant/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/tenant/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/tenant/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/tenant/profile', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.patch('/tenant/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await api.put('/tenant/preferences', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/tenant/account');
    return response.data;
  },
};
