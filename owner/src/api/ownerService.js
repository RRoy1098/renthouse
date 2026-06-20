import api from './axios';

export const ownerService = {
  getProfile: async () => {
    const response = await api.get('/owner/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/owner/profile', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.patch('/owner/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadDocuments: async (formData) => {
    const response = await api.post('/owner/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
