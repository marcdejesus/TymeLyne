import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';

// Create context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stored auth data when app starts
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Load user data from AsyncStorage
  const loadStoredAuth = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && refreshToken) {
        // If we have both tokens, check if the access token is still valid
        // by trying to get the current user
        try {
          const userData = await userAPI.getCurrentUser();
          // If successful, set the user data
          setUser(userData);
          setProfile(userData.profile || {});
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // If the token is invalid, try to refresh it
          if (error.response?.status === 401) {
            try {
              const response = await authAPI.refreshToken(refreshToken);
              const { access } = response.data;
              await AsyncStorage.setItem('access_token', access);
              
              // Retry getting user data with the new token
              const userData = await userAPI.getCurrentUser();
              setUser(userData);
              setProfile(userData.profile || {});
              await AsyncStorage.setItem('user', JSON.stringify(userData));
            } catch (refreshError) {
              // If refresh fails, log out
              console.log('Token refresh failed:', refreshError);
              await logout();
            }
          } else {
            console.log('Error getting user data:', error);
          }
        }
      } else if (userData) {
        // If we only have user data but no tokens, set it temporarily
        // but immediately try to refresh the user data
        setUser(JSON.parse(userData));
        fetchUserData();
      }
    } catch (error) {
      console.log('Error loading stored auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data from the API
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;
      
      const userData = await userAPI.getCurrentUser();
      
      // Store user data
      setUser(userData);
      setProfile(userData.profile || {});
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.log('Error fetching user data:', error);
      // If unauthorized, clear the stored data
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  // Login with username and password
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call login API
      const response = await authAPI.login(username, password);
      const { access, refresh, user } = response.data;
      
      // Store tokens and user
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setProfile(user.profile || {});
      
      return true;
    } catch (error) {
      console.log('Login error:', error);
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call register API
      const response = await authAPI.register(userData);
      const { access, refresh, user } = response.data;
      
      // Store tokens and user
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setProfile(user.profile || {});
      
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      
      // Handle validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Registration failed. Please try again.';
        
        // Convert validation errors to readable message
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .filter(([key]) => key !== 'non_field_errors')
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`);
          
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          }
        }
        
        setError(errorMessage);
      } else {
        setError('Registration failed. Please try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call update profile API
      const updatedProfile = await userAPI.updateProfile(profileData);
      
      // Update user object with new profile
      const updatedUser = { ...user, profile: updatedProfile };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setProfile(updatedProfile);
      
      return true;
    } catch (error) {
      console.log('Profile update error:', error);
      setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout API to clear tokens on client side
      await authAPI.logout();
      
      // Ensure state is cleared
      setUser(null);
      setProfile(null);
      
      // Return success
      return true;
    } catch (error) {
      console.log('Logout error:', error);
      
      // Force clear state even if API fails
      setUser(null);
      setProfile(null);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context value
  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    updateProfile,
    logout,
    refreshUser: fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 