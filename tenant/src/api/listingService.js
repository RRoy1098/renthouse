import api from './axios';

export const listingService = {
  getAll: async (params = {}) => {
    const response = await api.get('/listing', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/listing/${id}`);
    return response.data;
  },

  search: async (params = {}) => {
    const response = await api.get('/tenant/search', { params });
    return response.data;
  },
};

export const reviewService = {
  getListingReviews: async (listingId) => {
    const response = await api.get(`/review/listing/${listingId}`);
    return response.data;
  },

  createReview: async (data) => {
    const response = await api.post('/review', data);
    return response.data;
  },
};
