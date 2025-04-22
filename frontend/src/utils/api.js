import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for API
const API_URL = 'http://10.0.2.2:5001/api'; // Android emulator
// Use 'http://localhost:5001/api' for iOS simulator or web

const api = axios.create({
  baseURL: API_URL,
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

export default api; 