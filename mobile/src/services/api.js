import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Live Render Backend API Endpoint
const API_BASE_URL = 'https://inventory-wh75.onrender.com/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach JWT Bearer Token to all outgoing requests
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('inventory_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
