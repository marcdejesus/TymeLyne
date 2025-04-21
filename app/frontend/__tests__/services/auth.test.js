import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../src/services/api';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  defaults: { headers: { common: {} } }
}));

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    it('should login successfully', async () => {
      const username = 'testuser';
      const password = 'password123';
      const mockResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
          user: { id: 1, username: 'testuser' }
        }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await authAPI.login(username, password);
      
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/auth/login/'), {
        username,
        password
      });
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle login failure with invalid credentials', async () => {
      const username = 'wronguser';
      const password = 'wrongpass';
      const mockError = {
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' }
        }
      };
      
      axios.post.mockRejectedValueOnce(mockError);
      
      await expect(authAPI.login(username, password)).rejects.toEqual(mockError);
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/auth/login/'), {
        username,
        password
      });
    });
    
    it('should handle network errors during login', async () => {
      const username = 'testuser';
      const password = 'password123';
      const mockError = new Error('Network Error');
      
      axios.post.mockRejectedValueOnce(mockError);
      
      await expect(authAPI.login(username, password)).rejects.toEqual(mockError);
    });
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        password2: 'password123'
      };
      const mockResponse = {
        data: {
          id: 1,
          username: 'newuser',
          email: 'new@example.com'
        },
        status: 201
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await authAPI.register(userData);
      
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/auth/register/'), userData, expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle registration failure with existing username', async () => {
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        password2: 'password123'
      };
      const mockError = {
        response: {
          status: 400,
          data: { username: ['A user with that username already exists.'] }
        }
      };
      
      axios.post.mockRejectedValueOnce(mockError);
      
      await expect(authAPI.register(userData)).rejects.toEqual(mockError);
    });
  });
  
  describe('logout', () => {
    it('should logout successfully and clear storage', async () => {
      const refreshToken = 'refresh-token';
      const mockResponse = { status: 204 };
      
      AsyncStorage.getItem.mockResolvedValueOnce(refreshToken);
      axios.post.mockResolvedValueOnce(mockResponse);
      
      await authAPI.logout();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/auth/logout/'), { refresh: refreshToken });
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'refresh_token', 'user']);
    });
    
    it('should still clear storage even if server logout fails', async () => {
      const refreshToken = 'refresh-token';
      const mockError = new Error('Network Error');
      
      AsyncStorage.getItem.mockResolvedValueOnce(refreshToken);
      axios.post.mockRejectedValueOnce(mockError);
      
      await authAPI.logout();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/auth/logout/'), { refresh: refreshToken });
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'refresh_token', 'user']);
    });
    
    it('should handle logout when no refresh token exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      await authAPI.logout();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(axios.post).not.toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'refresh_token', 'user']);
    });
  });
}); 