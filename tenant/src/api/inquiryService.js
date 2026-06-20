import api from './axios';

export const inquiryService = {
  create: async (data) => {
    const response = await api.post('/inquiry', data);
    return response.data;
  },

  getMyInquiries: async () => {
    const response = await api.get('/inquiry/tenant');
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.patch(`/inquiry/${id}/cancel`);
    return response.data;
  },
};
