import axios from 'axios';

// Check if frontend is on different host/port or using proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  restock: (id, quantity) => api.post(`/products/${id}/restock`, { quantity }),
  getLowStockAlerts: () => api.get('/products/alerts/low-stock'),
  getRestockSuggestions: () => api.get('/products/restock-suggestions'),
  getCategories: () => api.get('/products/categories'),
};

export const salesApi = {
  getAll: () => api.get('/sales'),
  record: (data) => api.post('/sales', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  checkHealth: () => api.get('/health'),
};

export default api;
