import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('inventory_token');
      const storedUser = await AsyncStorage.getItem('inventory_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with server in background
        fetchCurrentUser()
          .then((res) => {
            setUser(res.data);
            AsyncStorage.setItem('inventory_user', JSON.stringify(res.data));
          })
          .catch(() => {
            // Token might be expired
            logout();
          });
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await loginUser({ username, password });
      const { token: userToken, ...userData } = res.data;

      await AsyncStorage.setItem('inventory_token', userToken);
      await AsyncStorage.setItem('inventory_user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      let msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          msg = 'Server is waking up (Render). Please wait a moment and try again.';
        } else {
          msg = 'Cannot reach API. Check internet connection or try again in a minute.';
        }
      }
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('inventory_token');
      await AsyncStorage.removeItem('inventory_user');
    } catch (e) {
      console.error('Error logging out:', e);
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
