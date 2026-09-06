import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://inventory-wh75.onrender.com/api' : '/api'),
});

// Interceptor to attach Authorization Bearer token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('inventory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API Calls
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const fetchCurrentUser = () => API.get('/auth/me');

// Inventory Items API Calls
export const fetchDashboardStats = () => API.get('/items/stats');
export const fetchItems = (params) => API.get('/items', { params });
export const fetchItemById = (id) => API.get(`/items/${id}`);
export const createItem = (itemData) => API.post('/items', itemData);
export const updateItem = (id, itemData) => API.put(`/items/${id}`, itemData);
export const quickStockAdjust = (id, stockData) => API.patch(`/items/${id}/stock`, stockData);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const bulkDeleteItems = (ids) => API.post('/items/bulk-delete', { ids });

// Transactions API Calls
export const fetchTransactions = (params) => API.get('/transactions', { params });

export default API;
