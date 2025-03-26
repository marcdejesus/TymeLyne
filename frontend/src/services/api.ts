import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../hooks/useAuth';

// API base URL - update the IP address to your computer's IP on the local network
// Replace 192.168.1.61 with your actual local IP address found using ipconfig
const API_URL = 'http://192.168.1.61:8000/api';

// Keys for storing tokens in AsyncStorage
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/**
 * API client for communicating with the Django backend
 */
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the stored auth tokens
   */
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting tokens from storage:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * Store the auth tokens
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Clear the stored auth tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any, 
    isFormData: boolean = false
  ): Promise<T> {
    const { accessToken } = await this.getTokens();
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    if (data) {
      if (isFormData) {
        // For multipart/form-data (e.g., file uploads)
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    try {
      const response = await fetch(url, options);
      
      // Check if token is expired
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Try the request again with new token
          return this.request<T>(endpoint, method, data, isFormData);
        } else {
          throw new Error('Authentication failed');
        }
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Something went wrong');
      }
      
      return responseData as T;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const { refreshToken } = await this.getTokens();
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (!response.ok) {
        await this.clearTokens();
        return false;
      }
      
      const data = await response.json();
      await this.setTokens(data.access, data.refresh || refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return false;
    }
  }
  
  /**
   * Register a new user
   */
  async register(
    username: string, 
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<{ user: UserProfile; tokens: { access: string; refresh: string } }> {
    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        password2: password,
        full_name: fullName,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    
    await this.setTokens(data.tokens.access, data.tokens.refresh);
    return data;
  }
  
  /**
   * Login a user
   */
  async login(
    usernameOrEmail: string, 
    password: string
  ): Promise<{ user: UserProfile; tokens: { access: string; refresh: string } }> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: usernameOrEmail,
        password,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    
    await this.setTokens(data.tokens.access, data.tokens.refresh);
    return data;
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout/', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }
  
  /**
   * Get the current user's profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me/');
  }
  
  /**
   * Update the current user's profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/users/update_me/', 'PATCH', profileData);
  }
  
  /**
   * Upload a new avatar image
   */
  async uploadAvatar(file: FormData): Promise<UserProfile> {
    return this.request<UserProfile>('/users/upload_avatar/', 'POST', file, true);
  }
  
  /**
   * Change the user's password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.request('/auth/change-password/', 'POST', { 
      old_password: oldPassword,
      new_password: newPassword
    });
  }
  
  /**
   * Reset the user's password
   */
  async resetPassword(email: string): Promise<void> {
    return this.request('/auth/reset-password/', 'POST', { email });
  }
  
  /**
   * Get a user's goals
   */
  async getUserGoals(userId: string): Promise<any[]> {
    return this.request(`/goals/user/${userId}/`, 'GET');
  }
}

export const api = new ApiClient(API_URL); 