import api, { setToken } from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    return res.data;
  },

  async register(email, password, name) {
    const res = await api.post('/auth/register', { email, password, name });
    setToken(res.data.token);
    return res.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async demoLogin() {
    return authService.login('julian@chemsystem.edu', 'password123');
  },

  logout() {
    setToken(null);
  },
};
