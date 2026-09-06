import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('inventory_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetchCurrentUser();
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const res = await loginUser({ username, password });
      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('inventory_token', userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('inventory_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
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
