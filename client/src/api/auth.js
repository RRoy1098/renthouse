import api from './axios.js';

export const loginTenant = async (email, password) => {
  const response = await api.post('/api/auth/tenant/login', { email, password });
  return response.data;
};

export const registerTenant = async (data) => {
  const response = await api.post('/api/auth/tenant/register', data);
  return response.data;
};
