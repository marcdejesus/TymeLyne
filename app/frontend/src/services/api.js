import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Define base URL configuration for different environments
// The API URL determination is critical for proper connectivity

// Helper to determine the API URL based on environment
const determineApiUrl = () => {
  // Check if running in Docker from environment variable
  const isDocker = process.env.REACT_APP_API_URL === 'docker';
  
  // Get API URL based on environment
  if (isDocker) {
    // When running in Docker, use the service name
    return 'http://backend:8000/api';
  } else if (Platform.OS === 'android') {
    // Android emulator needs special IP for localhost
    return 'http://10.0.2.2:8000/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000/api';
  } else {
    // Web or fallback
    return 'http://localhost:8000/api';
  }
};

// Determine the BASE_URL
const BASE_URL = determineApiUrl();

// Log the API URL for debugging
console.log('API URL being used:', BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Add request interceptor to inject the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await AsyncStorage.getItem('access_token');
      
      // If token exists, add it to the header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging (in development)
      if (__DEV__) {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, 
        response.status, response.data ? 'data received' : 'no data');
    }
    return response;
  },
  async (error) => {
    // Log error responses in development
    if (__DEV__) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, can't proceed
          console.log('No refresh token available');
          return Promise.reject(error);
        }
        
        console.log('Attempting to refresh token...');
        
        // Use a direct axios instance instead of our api instance to avoid infinite loop
        const response = await axios.post(`${BASE_URL}/users/auth/refresh/`, {
          refresh: refreshToken
        });
        
        // Store the new access token
        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);
        
        console.log('Token refreshed successfully');
        
        // Update header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // If refresh fails, clear tokens and reject
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        return Promise.reject(refreshError);
      }
    }
    
    // Network errors need special handling
    if (error.message === 'Network Error') {
      console.error('Network error detected. API server may be unreachable.');
      // Could dispatch an action here to update app state for network status
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/auth/login/`, { 
        username, 
        password 
      });
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/auth/register/`, userData);
      return response;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/auth/refresh/`, { 
        refresh: refreshToken 
      });
      return response;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post(`${BASE_URL}/users/auth/logout/`, { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      // Always clear storage on logout, even if API call fails
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
  },
  
  requestPasswordReset: async (data) => {
    const response = await axios.post(`${BASE_URL}/users/auth/password-reset/`, data);
    return response.data;
  },
  
  confirmPasswordReset: async (data) => {
    const response = await axios.post(`${BASE_URL}/users/auth/password-reset/confirm/`, data);
    return response.data;
  },
  
  verifyEmail: async (data) => {
    const response = await axios.post(`${BASE_URL}/users/auth/email/verify/`, data);
    return response.data;
  },
};

// User API
export const userAPI = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me/');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/me/update/', { profile: profileData });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getUserDashboard: () => 
    api.get('/users/dashboard/'),
  
  uploadProfilePicture: async (imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';
    
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type,
    });
    
    const response = await api.post('/users/me/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Course API
export const courseAPI = {
  getAllCourses: () => 
    api.get('/users/courses/'),
  
  getCourseById: (courseId) => 
    api.get(`/users/courses/${courseId}/`),
  
  enrollInCourse: (courseId) => 
    api.post(`/users/courses/${courseId}/enroll/`),
  
  getUserCourseProgress: () => 
    api.get('/users/progress/courses/'),
};

// Activity API
export const activityAPI = {
  completeActivity: (activityId, data) => 
    api.post(`/users/activities/${activityId}/complete/`, data),
  
  getUserActivityProgress: () => 
    api.get('/users/progress/activities/'),
};

// Achievement API
export const achievementAPI = {
  getAllAchievements: () => 
    api.get('/users/achievements/'),
  
  getUserAchievements: () => 
    api.get('/users/user-achievements/'),
};

// Certificate API
export const certificateAPI = {
  getUserCertificates: () => 
    api.get('/users/certificates/'),
};

export default api; 