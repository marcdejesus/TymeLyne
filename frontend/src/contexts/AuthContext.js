import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import apiConfig from '../config/apiConfig';

export const AuthContext = createContext();

// Load API URL from config file
const API_URL = apiConfig.apiUrl;
console.log('🌐 API URL set to:', API_URL);

// Configure axios defaults
axios.defaults.timeout = apiConfig.timeout;
axios.interceptors.request.use(request => {
  console.log('🔄 Making request to:', request.url);
  return request;
});

const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      console.log('🔁 Checking for existing session...');
      try {
        // Retrieve token from secure storage
        const token = await SecureStore.getItemAsync('userToken');
        
        if (token) {
          console.log('🔑 Token found in storage');
          setUserToken(token);
          
          // Retrieve user data
          const userDataJson = await SecureStore.getItemAsync('user');
          if (userDataJson) {
            const userData = JSON.parse(userDataJson);
            console.log('👤 User data retrieved from storage:', {
              username: userData.username,
              email: userData.email,
              isVerified: userData.is_verified
            });
            setUser(userData);
          } else {
            console.log('❓ No user data found in storage');
          }
        } else {
          console.log('🔒 No token found, user is not logged in');
        }
      } catch (e) {
        console.error('🔴 Error restoring session:', e);
      } finally {
        // Short delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    console.log('🔶 LOGIN ATTEMPT:', { email });
    setIsLoading(true);
    setError(null);
    setNeedsVerification(false);
    
    try {
      // Call the backend API
      console.log(`⚙️ Making login request to ${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { token, user, message } = response.data;
      console.log('✅ LOGIN SUCCESSFUL:', { 
        username: user.username, 
        email: user.email,
        isVerified: user.is_verified
      });

      // Store token and user data
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      setUserToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('🔴 LOGIN ERROR:', error.response?.data || error.message);
      console.error('Error details:', error);
      
      // Check if the error is due to unverified email
      if (error.response?.status === 401 && error.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setError('Email not verified. Please check your inbox for verification email.');
        return { 
          success: false, 
          error: 'Email not verified',
          needsVerification: true
        };
      }
      
      setError(error.response?.data?.message || error.message || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('🔶 REGISTER ATTEMPT:', { 
      email: userData.email, 
      username: userData.username 
    });
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the backend API
      console.log(`⚙️ Making registration request to ${API_URL}/auth/register`);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { success, needsVerification, message, user } = response.data;
      console.log('✅ REGISTRATION SUCCESSFUL', { 
        username: user.username, 
        email: user.email,
        isVerified: user.is_verified,
        needsVerification,
        message
      });
      
      // Don't store token or set user as logged in
      // User must verify email first
      
      // Set needsVerification flag
      setNeedsVerification(needsVerification);
      
      return { 
        success: true,
        message: message,
        needsVerification: true
      };
    } catch (error) {
      console.error('🔴 REGISTER ERROR:', error.response?.data || error.message);
      console.error('Error details:', error);
      setError(error.response?.data?.message || error.message || 'Registration failed');
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email) => {
    console.log('🔶 RESEND VERIFICATION ATTEMPT:', { email });
    
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      console.log('✅ VERIFICATION EMAIL RESENT:', { email, message: response.data.message });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('🔴 RESEND VERIFICATION ERROR:', error.response?.data || error.message);
      console.error('Error details:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to resend verification email'
      };
    }
  };

  const logout = async () => {
    console.log('🔶 LOGOUT ATTEMPT');
    setIsLoading(true);
    
    try {
      // Remove token and user data from storage
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('user');
      
      // Clear state
      setUserToken(null);
      setUser(null);
      console.log('✅ LOGOUT SUCCESSFUL');
    } catch (e) {
      console.error('🔴 LOGOUT ERROR:', e);
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
        needsVerification,
        login,
        register,
        logout,
        resendVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 