import api from './axios';

export const listingService = {
  getMyListings: async () => {
    const response = await api.get('/owner/listings');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/listing/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post('/listing', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/listing/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/listing/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/listing/${id}`);
    return response.data;
  },

  deleteImage: async (id, publicId) => {
    const response = await api.delete(`/listing/${id}/images`, {
      params: { publicId },
    });
    return response.data;
  },
};
