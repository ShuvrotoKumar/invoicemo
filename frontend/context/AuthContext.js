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
          const response = await authApi.getMe();
          setUser(response.data); // Backend structure: { status: 'success', data: userObject }
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
      const response = await authApi.login(credentials);
      // Backend response structure: { status: 'success', data: { user, accessToken, refreshToken } }
      const { user, accessToken } = response.data;
      
      if (!accessToken) {
        throw new Error('Access token not found in response');
      }

      localStorage.setItem('token', accessToken);
      setUser(user);
      message.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      // Backend response structure: { status: 'success', data: { user, accessToken, refreshToken } }
      const { user, accessToken } = response.data;

      if (!accessToken) {
        throw new Error('Access token not found in response');
      }
      
      localStorage.setItem('token', accessToken);
      setUser(user);
      message.success('Registered successfully');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
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
