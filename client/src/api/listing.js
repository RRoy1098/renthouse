import api from './axios.js';

export const getListings = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await api.get(`/api/tenant/search?${params.toString()}`);
  return response.data;
};

export const getListingById = async (id) => {
  const response = await api.get(`/api/listing/${id}`);
  return response.data;
};
