import api from './axios';

export const inquiryService = {
  getOwnerInquiries: async () => {
    const response = await api.get('/inquiry/owner');
    return response.data;
  },

  replyToInquiry: async (id, data) => {
    const response = await api.put(`/inquiry/${id}/reply`, data);
    return response.data;
  },
};
