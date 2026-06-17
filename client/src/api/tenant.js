import api from './axios.js';

export const getTenantProfile = async () => {
  const response = await api.get('/api/tenant/me');
  return response.data;
};

export const updateTenantProfile = async (profileData) => {
  const response = await api.put('/api/tenant/profile', profileData);
  return response.data;
};

export const getTenantListings = async () => {
  const response = await api.get('/api/tenant/search');
  return response.data;
};
