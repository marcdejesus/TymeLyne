import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

// UserProfile interface for the app
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string | null;
  avatar?: string | null;
  avatar_preview_uri?: string; // Local URI for displaying selected image preview
  avatar_retry_count?: number; // Track number of retries for loading avatar
  role?: 'USER' | 'ADMIN' | 'PREMIUM';
  created_at: string;
  updated_at: string;
}

// A simplified authentication hook that uses Django backend instead of Supabase
export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    // Initialize auth state from storage
    const initAuth = async () => {
      try {
        // Check if we have tokens in storage
        const { accessToken } = await api.getTokens();
        
        if (accessToken) {
          try {
            // Fetch the current user profile
            const userProfile = await api.getCurrentUser();
            setUser({ id: userProfile.id });
            setProfile(userProfile);
            setAdmin(userProfile.role === 'ADMIN');
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Clear tokens if profile fetch fails
            await api.clearTokens();
            setUser(null);
            setProfile(null);
            setAdmin(false);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      setUser({ id: data.user.id });
      setProfile(data.user);
      setAdmin(data.user.role === 'ADMIN');
      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      // Generate a username from the email if not provided
      const username = email.split('@')[0];
      
      const data = await api.register(username, email, password, fullName);
      setUser({ id: data.user.id });
      setProfile(data.user);
      setAdmin(data.user.role === 'ADMIN');
      return { data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setProfile(null);
      setAdmin(false);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    try {
      if (!user) return null;
      
      const userProfile = await api.getCurrentUser();
      setProfile(userProfile);
      setAdmin(userProfile.role === 'ADMIN');
      return userProfile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
    if (!user) return { data: null, error: new Error('No user logged in') };
      
      const updatedProfile = await api.updateProfile(updates);
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const updateAvatar = async (file: FormData) => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      // Extract the file object for validation
      const fileObject = file.get('file') as any;
      if (!fileObject) {
        return { data: null, error: new Error('No file provided') };
      }

      // Log the file properties for debugging
      console.log('File for upload:', {
        uri: fileObject.uri,
        name: fileObject.name,
        type: fileObject.type
      });

      // Validate the image file before uploading
      try {
        // Verify the source file exists and is valid
        const sourceFileInfo = await fetch(fileObject.uri, { method: 'HEAD' });
        if (!sourceFileInfo.ok) {
          throw new Error(`Source file validation failed: ${sourceFileInfo.status}`);
        }
        
        const contentLength = sourceFileInfo.headers.get('content-length');
        if (!contentLength || parseInt(contentLength) < 100) {
          throw new Error('Source file too small or invalid');
        }
        
        console.log('Source file validated, size:', contentLength, 'bytes');
      } catch (validationError) {
        console.error('Error validating source file:', validationError);
        // Continue anyway as the fetch might still work
      }

      // Upload the avatar to the Django backend
      const updatedProfile = await api.uploadAvatar(file);
      
      // Update the profile with the new avatar URL
          setProfile({
            ...profile,
        ...updatedProfile,
            avatar_preview_uri: fileObject.uri // Keep the preview URI
          });
      
      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { data: null, error };
    }
  };

  return {
    user,
    profile,
    admin,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    updateAvatar,
  };
} 