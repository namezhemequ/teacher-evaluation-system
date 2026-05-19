import { defineStore } from 'pinia';
import api from '../api';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin',
    isTeacher: (state) => state.userInfo?.role === 'teacher',
  },
  actions: {
    async login(username, password) {
      const res = await api.auth.login({ username, password });
      if (res.code === 200) {
        this.token = res.data.token;
        this.userInfo = res.data.userInfo;
        localStorage.setItem('token', this.token);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        return true;
      }
      return false;
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    async fetchProfile() {
      try {
        const res = await api.auth.getProfile();
        if (res.code === 200) {
          this.userInfo = res.data;
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }
    },
  },
});