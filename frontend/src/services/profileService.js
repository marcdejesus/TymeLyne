import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import apiConfig from '../config/apiConfig';
import api from '../utils/api';

const API_URL = apiConfig.apiUrl;

/**
 * Upload a profile picture to the server
 * 
 * @param {FormData} formData Form data containing the profile picture file
 * @param {string} token Authorization token
 * @returns {Promise} The response from the server
 */
export const uploadProfilePicture = async (formData, token) => {
  try {
    console.log('Uploading profile picture to:', `/profiles/upload-picture`);
    
    // Check if we're in development/testing mode with mock API
    if (__DEV__ && global.MOCK_API) {
      // Create mock response for testing without a backend
      console.log('Using mock profile picture upload');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a random profile image path for testing
      const randomNum = Math.floor(Math.random() * 1000);
      
      // Use a relative path for consistent URL construction
      const mockProfileUrl = `/uploads/profiles/user-${randomNum}.jpg`;
      
      // Return mock successful response
      return {
        success: true, 
        message: 'Profile picture uploaded successfully',
        profilePicture: mockProfileUrl
      };
    }
    
    // Create a custom instance for form data upload
    const token = await SecureStore.getItemAsync('userToken');
    const uploadInstance = axios.create({
      baseURL: API_URL,
      timeout: 30000, // Longer timeout for file uploads
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': token
      }
    });
    
    // Log the headers being sent
    console.log('Uploading with headers:', uploadInstance.defaults.headers);
    
    // Real API call
    const response = await uploadInstance.post('/profiles/upload-picture', formData);
    
    console.log('Upload response from server:', response.data);
    
    // Process the response
    if (response.data && response.status >= 200 && response.status < 300) {
      if (response.data.profile_picture) {
        return {
          success: true,
          profilePicture: response.data.profile_picture,
          message: response.data.message || 'Profile picture updated successfully'
        };
      } else if (response.data.profilePicture) {
        return {
          success: true,
          profilePicture: response.data.profilePicture,
          message: response.data.message || 'Profile picture updated successfully'
        };
      } else if (response.data.path) {
        return {
          success: true,
          profilePicture: response.data.path,
          message: response.data.message || 'Profile picture updated successfully'
        };
      } else {
        // Generic success with incomplete data
        return {
          success: true,
          profilePicture: `/uploads/profiles/user-${Date.now()}.jpg`, // Fallback
          message: 'Profile picture updated successfully'
        };
      }
    }
    
    // Return the raw response if none of the above matches
    return {
      success: false,
      message: 'Server returned an unexpected response format'
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    
    // Return error in a consistent format
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error uploading profile picture'
    };
  }
};

/**
 * Update user profile information
 * 
 * @param {Object} profileData Profile data to update
 * @param {string} token Authorization token
 * @returns {Promise} The response from the server
 */
export const updateProfile = async (profileData, token = null) => {
  try {
    // Use our api utility which handles auth tokens automatically
    const response = await api.put(
      '/profiles',
      profileData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * 
 * @param {string} userId User ID (optional - if not provided, returns current user's profile)
 * @param {string} token Authorization token
 * @returns {Promise} The response from the server
 */
export const getProfile = async (userId = null, token = null) => {
  try {
    // Use our api utility which handles auth tokens automatically
    const endpoint = userId 
      ? `/profiles/${userId}`
      : '/auth/me';
      
    const response = await api.get(endpoint);
    
    return response.data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}; 