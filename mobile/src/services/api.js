import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Production APK → Render (Inventory DB)
 * Expo __DEV__ → local testing API (Testing DB) on your Mac
 *
 * Physical phone must use Mac LAN IP (not localhost).
 * Android emulator can use 10.0.2.2
 */
const MAC_LAN_IP = '10.13.46.227';
const DEV_HOST = `http://${MAC_LAN_IP}:5002`;

const API_BASE_URL = __DEV__
  ? `${DEV_HOST}/api`
  : 'https://inventory-wh75.onrender.com/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

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

export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const fetchCurrentUser = () => API.get('/auth/me');

export const fetchDashboardStats = () => API.get('/items/stats');
export const fetchItems = (params) => API.get('/items', { params });
export const fetchItemById = (id) => API.get(`/items/${id}`);
export const createItem = (itemData) => API.post('/items', itemData);
export const updateItem = (id, itemData) => API.put(`/items/${id}`, itemData);
export const quickStockAdjust = (id, stockData) => API.patch(`/items/${id}/stock`, stockData);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const bulkDeleteItems = (ids) => API.post('/items/bulk-delete', { ids });

export const fetchTransactions = (params) => API.get('/transactions', { params });

export default API;
