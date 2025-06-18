import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import apiConfig from '../config/apiConfig';

// Create an axios instance with config from apiConfig
const api = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for development mode
if (__DEV__) {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // Check if this is a profile picture upload that failed
      // and we're in development/mock mode
      if (error.config && 
          error.config.url === '/profiles/upload-picture' && 
          error.config.method === 'post' &&
          global.MOCK_API) {
        
        console.log('Mock handling profile picture upload in development mode');
        
        // Create a mock successful response
        const mockResponse = {
          status: 200,
          statusText: 'OK',
          data: {
            success: true,
            message: 'Profile picture uploaded successfully',
            profile_picture: `/uploads/profiles/user-${Math.floor(Math.random() * 1000)}.jpg`
          }
        };
        
        return Promise.resolve(mockResponse);
      }
      
      return Promise.reject(error);
    }
  );
}

export default api; 