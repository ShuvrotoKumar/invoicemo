"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { message } from 'antd';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await authApi.getMe();
          setUser(data);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data, token } = await authApi.login(credentials);
      localStorage.setItem('token', token);
      setUser(data);
      message.success('Logged in successfully');
      return true;
    } catch (error) {
      message.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { data, token } = await authApi.register(userData);
      localStorage.setItem('token', token);
      setUser(data);
      message.success('Registered successfully');
      return true;
    } catch (error) {
      message.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
