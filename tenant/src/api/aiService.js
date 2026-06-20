import api from './axios';

export const aiService = {
  chat: async (data) => {
    const response = await api.post('/ai/chat', data);
    return response.data;
  },

  parseSearch: async (query) => {
    const response = await api.post('/ai/parse-search', { query });
    return response.data;
  },

  draftMessage: async (data) => {
    const response = await api.post('/ai/draft-message', data);
    return response.data;
  },
};
