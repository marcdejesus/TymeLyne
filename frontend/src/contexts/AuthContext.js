import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = 'http://10.0.2.2:5000/api'; // for Android emulator

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setUserToken(token);
          // Get user profile
          const userDataJson = await SecureStore.getItemAsync('user');
          if (userDataJson) {
            setUser(JSON.parse(userDataJson));
          }
        }
      } catch (e) {
        console.log('Error restoring token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      setUserToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.log('Login error:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token, user } = response.data;
      
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      setUserToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.log('Register error:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'Registration failed');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('user');
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 