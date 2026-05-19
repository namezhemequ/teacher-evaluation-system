import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    ElMessage.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

export default {
  auth: {
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
  },
  plans: {
    list: (params) => api.get('/plans', { params }),
    getById: (id) => api.get(`/plans/${id}`),
    create: (data) => api.post('/plans', data),
    update: (id, data) => api.put(`/plans/${id}`, data),
    publish: (id) => api.put(`/plans/${id}/publish`),
    delete: (id) => api.delete(`/plans/${id}`),
  },
  evaluations: {
    getByPlan: (planId) => api.get(`/plans/${planId}/evaluations`),
    submit: (planId, data) => api.post(`/plans/${planId}/evaluations`, data),
    getById: (id) => api.get(`/evaluations/${id}`),
    archive: (id) => api.put(`/evaluations/${id}/status`),
  },
  records: {
    list: (params) => api.get('/records', { params }),
  },
  statistics: {
    trend: (params) => api.get('/statistics/trend', { params }),
    comparison: (params) => api.get('/statistics/comparison', { params }),
    distribution: () => api.get('/statistics/distribution'),
  },
};