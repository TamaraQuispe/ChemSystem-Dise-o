import api from './api';
import { mapCompoundToUI } from './experimentService';

export const dataService = {
  async getCompounds(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await api.get(`/compounds${query}`);
    return res.data.map(mapCompoundToUI);
  },

  async getRecommendations() {
    const res = await api.get('/ai/recommendations');
    return res.data;
  },

  async getPredictions() {
    const res = await api.get('/predictions');
    return res.data;
  },

  async getNotifications() {
    const res = await api.get('/notifications');
    return res;
  },

  async getModules() {
    const res = await api.get('/modules');
    return res.data;
  },
};
