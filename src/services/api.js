import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const { access_token } = response.data;
          localStorage.setItem('accessToken', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }),
};

// Expenses API
export const expensesAPI = {
  getExpenses: (params) =>
    api.get('/expenses/', { params }),
  
  createExpense: (data) =>
    api.post('/expenses/', data),
  
  getExpense: (id) =>
    api.get(`/expenses/${id}`),
  
  updateExpense: (id, data) =>
    api.put(`/expenses/${id}`, data),
  
  deleteExpense: (id) =>
    api.delete(`/expenses/${id}`),
  
  exportExpenses: (params) =>
    api.get('/expenses/export', { params, responseType: 'blob' }),
};

// Analytics API
export const analyticsAPI = {
  getSummary: (params) =>
    api.get('/analytics/summary', { params }),
  
  getTrends: (params) =>
    api.get('/analytics/trends', { params }),
  
  getCategoryBreakdown: (params) =>
    api.get('/analytics/category-breakdown', { params }),
  
  getCategoryTrends: (category, params) =>
    api.get(`/analytics/category-trends/${category}`, { params }),
  
  getPrediction: () =>
    api.get('/analytics/prediction'),
  
  getInsights: () =>
    api.get('/analytics/insights'),
  
  getHeatmap: (params) =>
    api.get('/analytics/heatmap', { params }),
};

// Budget API
export const budgetAPI = {
  getBudget: () =>
    api.get('/budget/'),
  
  updateBudget: (data) =>
    api.put('/budget/', data),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data) =>
    api.put('/users/profile', data),
};

export default api;
