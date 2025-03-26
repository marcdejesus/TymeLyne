import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, ImageBackground, Platform, Switch } from 'react-native';
import { Button, TextInput, Avatar, Divider, Card, IconButton, Modal, Portal } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { UserProfile } from '../../hooks/useAuth';
import * as FileSystem from 'expo-file-system';
import AppHeader from '../../components/layout/AppHeader';
import NotificationSettings from '../../components/profile/NotificationSettings';
import ProfileThemeSelector from '../../components/profile/ProfileThemeSelector';
import { fixStorageUrl, getDirectDownloadUrl } from '../../utils/storageUtils';
import { useTheme, AccentKey, accentThemes } from '../../contexts/ThemeContext';
import AchievementBadges from '../../components/profile/AchievementBadges';
import { useNavigation } from '@react-navigation/native';

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export default function ProfileScreen() {
  const { user, profile, logout, updateProfile, updateAvatar, refreshProfile } = useAuth();
  const { theme, accentKey, setAccentKey, useSystemTheme, setUseSystemTheme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [initComplete, setInitComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState('');
  const [cachedAvatarUri, setCachedAvatarUri] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('purple');

  // Automatically run fixDatabaseIssues when the component mounts
  useEffect(() => {
    const initializeProfile = async () => {
      if (user && !initComplete) {
        setLoading(true);
        try {
          // Just refresh the profile data
          await refreshProfile();
          setInitComplete(true);
        } catch (error) {
          console.error('Error initializing profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeProfile();
  }, [user]);

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      
      // Cache the avatar URL locally
      if (profile.avatar_url && !profile.avatar_url.startsWith('local-avatar://')) {
        cacheAvatarImage(profile.avatar_url);
      }
    }
  }, [profile]);

  // Add a test function that uses XMLHttpRequest
  const xhrDownloadTest = async (url: string) => {
    if (!url) return;
    
    console.log('Testing XHR download for:', url);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    
    return new Promise((resolve, reject) => {
      xhr.onload = function() {
        if (xhr.status === 200) {
          const blob = xhr.response;
          console.log('XHR SUCCESS - Status:', xhr.status);
          console.log('XHR SUCCESS - Content-Type:', xhr.getResponseHeader('Content-Type'));
          console.log('XHR SUCCESS - Blob size:', blob.size);
          console.log('XHR SUCCESS - Blob type:', blob.type);
          resolve(blob);
        } else {
          console.log('XHR FAILURE - Status:', xhr.status);
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function(e) {
        console.log('XHR ERROR:', e);
        reject(new Error('Network error'));
      };
      
      xhr.send();
    });
  };

  // Add the test to the existing effect
  useEffect(() => {
    const testAvatarFetch = async () => {
      if (profile?.avatar_url) {
        console.log('TESTING DIRECT AVATAR FETCH');
        try {
          const avatarUrl = profile.avatar_url + '?t=' + new Date().getTime();
          console.log('Fetching from:', avatarUrl);
          
          // Test with fetch
          const response = await fetch(avatarUrl);
          console.log('Fetch Response status:', response.status);
          console.log('Fetch Response headers:', response.headers);
          
          const blob = await response.blob();
          console.log('Fetch Blob size:', blob.size);
          console.log('Fetch Blob type:', blob.type);
          
          if (blob.size > 0) {
            console.log('FETCH TEST SUCCESSFUL: Image downloaded successfully');
      } else {
            console.log('FETCH TEST FAILED: Downloaded blob is empty');
            
            // Try XMLHttpRequest as backup test
            try {
              if (profile.avatar_url) {
                await xhrDownloadTest(profile.avatar_url);
              }
            } catch (xhrError) {
              console.log('XHR TEST FAILED:', xhrError);
            }
          }
        } catch (error) {
          console.log('FETCH TEST ERROR:', error);
          
          // Try XMLHttpRequest as backup test
          try {
            if (profile.avatar_url) {
              await xhrDownloadTest(profile.avatar_url);
            }
          } catch (xhrError) {
            console.log('XHR TEST FAILED:', xhrError);
          }
        }
      }
    };
    
    if (profile) {
      testAvatarFetch();
    }
  }, [profile?.avatar_url]);

  const handleSignOut = async () => {
    setShowSettingsModal(false); // Close the settings modal
    
    // Show confirmation dialog
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await logout();
              if (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Logout failed',
                  text2: error.toString(),
                  position: 'bottom',
                });
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Toast.show({
                type: 'error',
                text1: 'Logout Error',
                text2: error instanceof Error ? error.message : 'Unknown error',
                position: 'bottom',
              });
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const refreshProfileData = async (showToast = true) => {
    setLoading(true);
    try {
        const refreshedProfile = await refreshProfile();
        
      if (refreshedProfile && showToast) {
          Toast.show({
            type: 'success',
            text1: 'Profile refreshed',
            text2: 'Latest profile data has been loaded'
          });
        }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: 'Error refreshing profile',
          text2: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const showSqlInstructions = () => {
    Alert.alert(
      'Database Setup Required',
      'Your account does not have permission to create tables or buckets in Supabase. Please follow these steps:\n\n1. Go to your Supabase dashboard\n2. Navigate to the SQL Editor\n3. Copy and paste the entire content from frontend/src/services/supabase.sql\n4. Click "Run" to execute it\n5. Restart your app',
      [
        { 
          text: 'OK', 
          style: 'default'
        }
      ]
    );
  };

  // Use the direct update function when normal updates fail
  const updateProfileViaRPC = async (updates: { fullName?: string; bio?: string; avatarUrl?: string }) => {
    if (!user?.email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to update your profile'
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase.rpc('direct_update_profile', {
        user_email: user.email,
        new_full_name: updates.fullName || null,
        new_bio: updates.bio || null,
        new_avatar_url: updates.avatarUrl || null
      });
      
      if (error) {
        console.error('Error updating profile via RPC:', error);
        const errorMessage = (error as SupabaseError).message || 'Unknown error';
        Toast.show({
          type: 'error',
          text1: 'Error updating profile',
          text2: errorMessage
        });
        return false;
      }
      
      console.log('Profile updated via RPC:', data);
      Toast.show({
        type: 'success',
        text1: 'Profile updated',
        text2: 'Your profile has been updated successfully'
      });
      
      // Force profile refresh 
      if (refreshProfile) {
        await refreshProfile();
      }
      
      return true;
    } catch (error) {
      console.error('Exception updating profile via RPC:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Not logged in',
        text2: 'You must be logged in to update your profile'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Updating profile with:', { full_name: fullName, bio });
      const { data, error } = await updateProfile({
        full_name: fullName,
        bio,
      });
      
      if (error) {
        console.error('Error updating profile:', error);
          Toast.show({
            type: 'error',
            text1: 'Error updating profile',
          text2: error.toString()
          });
        } else {
        Toast.show({
          type: 'success',
          text1: 'Profile updated',
          text2: 'Your profile has been updated successfully'
        });
        setEditing(false);
      }
    } catch (error) {
      console.error('Exception updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Ensure storage policies are fresh
      try {
        await supabase.rpc('reset_storage_policies', {
          bucket_name: 'avatars'
        });
        console.log('Storage policies reset successfully');
      } catch (policyError) {
        console.error('Error resetting storage policies:', policyError);
        // Continue anyway as this is just a precaution
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setIsUploading(true);
        
        // Save the preview image immediately for better UX
        setLocalImageUri(selectedAsset.uri);
        
        // Create a filename with extension based on the URI
        const uri = selectedAsset.uri;
        const fileName = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
        
        // Determine the content type based on file extension
        let contentType = 'image/jpeg';
        if (fileName.toLowerCase().endsWith('.png')) {
          contentType = 'image/png';
        } else if (fileName.toLowerCase().endsWith('.gif')) {
          contentType = 'image/gif';
        } else if (fileName.toLowerCase().endsWith('.webp')) {
          contentType = 'image/webp';
        }
        
        console.log('Selected image:', { uri, fileName, contentType });
        
        // Prepare file for upload
        const formData = new FormData();
        formData.append('file', {
          uri: selectedAsset.uri,
          name: fileName,
          type: contentType,
        } as any);

        // Ensure avatars bucket exists with correct permissions
        try {
          await supabase.rpc('create_avatars_bucket', {
            bucket_name: 'avatars',
            public_access: true
          });
          
          await supabase.rpc('update_avatars_mime_types', {
            mime_types: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
          });
          
          console.log('Avatars bucket configured');
        } catch (bucketError) {
          console.error('Bucket config error:', bucketError);
          // Continue anyway, the bucket might already exist
        }
        
        // Try direct Supabase storage upload
        try {
          const { data, error } = await updateAvatar(formData);
          
          if (error) {
            console.error('Avatar upload error:', error);
            Toast.show({ 
              type: 'error', 
              text1: 'Upload Failed', 
              text2: error.message || 'Could not upload profile picture'
            });
            setIsUploading(false);
            return;
          }
          
          // Update UI with the new avatar
          if (data && data.avatar_url) {
            Toast.show({
              type: 'success',
              text1: 'Profile Picture Updated',
              text2: 'Your new profile picture has been saved'
            });
            console.log('Avatar updated successfully:', data.avatar_url);
          }
        } catch (uploadError) {
          console.error('Upload exception:', uploadError);
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: 'Please try again later'
          });
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not open image picker'
      });
      setIsUploading(false);
    }
  };

  // Function to cache avatar image locally
  const cacheAvatarImage = async (imageUrl: string) => {
    try {
      if (!imageUrl || imageUrl.startsWith('local-avatar://') || !FileSystem) {
        return;
      }
      
      // Create a unique filename based on the URL
      const filename = imageUrl.split('/').pop() || 'avatar.jpg';
      const cacheDir = FileSystem.cacheDirectory + 'avatars/';
      const cacheFilePath = cacheDir + filename;
      
      // Check if directory exists, create if not
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      // Try direct fetch approach first (more reliable on some devices)
      try {
        console.log('Trying direct fetch for image:', imageUrl);
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Downloaded blob is empty');
        }
        
        console.log('Image fetched successfully, size:', blob.size);
        
        // Convert blob to base64
        const reader = new FileReader();
        return new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              if (typeof reader.result === 'string') {
                // Remove the data URL prefix
                const base64Data = reader.result.split(',')[1];
                
                // Write the file
                await FileSystem.writeAsStringAsync(cacheFilePath, base64Data, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                
                // Verify the file was written
      const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
                if (fileInfo.exists && fileInfo.size > 100) {
                  console.log('Avatar cached successfully at:', cacheFilePath, 'Size:', fileInfo.size);
        setCachedAvatarUri(cacheFilePath);
                  resolve();
                } else {
                  console.error('Failed to write file or file too small:', fileInfo);
                  reject(new Error('Failed to write file or file too small'));
                }
              } else {
                reject(new Error('FileReader result is not a string'));
              }
            } catch (e) {
              reject(e);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        console.error('Direct fetch failed:', fetchError);
        
        // Fall back to FileSystem.downloadAsync if direct fetch fails
        console.log('Falling back to FileSystem.downloadAsync:', imageUrl);
        
        // Add cache busting to force fresh download
        const downloadUrl = imageUrl.includes('?') 
          ? `${imageUrl}&t=${Date.now()}` 
          : `${imageUrl}?t=${Date.now()}`;
      
      // Download and cache the file
        console.log('Downloading avatar to cache:', downloadUrl);
        const { uri, status } = await FileSystem.downloadAsync(downloadUrl, cacheFilePath);
        
        if (status === 200) {
          // Verify file was downloaded correctly and is valid
          const downloadedFileInfo = await FileSystem.getInfoAsync(uri);
          if (downloadedFileInfo.exists && downloadedFileInfo.size && downloadedFileInfo.size > 100) {
            console.log('Avatar cached at:', uri, 'Size:', downloadedFileInfo.size, 'bytes');
      setCachedAvatarUri(uri);
          } else {
            console.error('Downloaded file is invalid or too small:', downloadedFileInfo);
            if (downloadedFileInfo.exists) {
              await FileSystem.deleteAsync(uri, { idempotent: true });
            }
            throw new Error('Downloaded avatar file is invalid');
          }
        } else {
          console.error('Avatar download failed with status:', status);
          throw new Error(`Download failed with status: ${status}`);
        }
      }
    } catch (error) {
      console.error('Error caching avatar image:', error);
    }
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const handleNotificationsPress = () => {
    setShowNotificationsModal(true);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    // In a real app, this would update the app theme
    Toast.show({
      type: 'success',
      text1: 'Theme Updated',
      text2: 'Your app theme has been changed successfully'
    });
  };

  const handleNotificationSettingsChange = (settings: Record<string, boolean>) => {
    // Here you would typically save the notification settings
    console.log('Notification settings changed:', settings);
    // Show feedback to user
    Toast.show({
      type: 'success',
      text1: 'Settings Saved',
      text2: 'Your notification preferences have been updated'
    });
  };

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
        <ActivityIndicator size="large" color="#6200ee" style={styles.loadingIndicator} />
      </View>
    );
  }

  // Function to get avatar source with better error handling
  const getAvatarSource = () => {
    // First check for a local preview image from the current session
    if (localImageUri) {
      console.log('Using local image URI:', localImageUri);
      return { uri: localImageUri };
    }
    
    // Then check for a locally cached image
    if (cachedAvatarUri) {
      console.log('Using cached avatar image:', cachedAvatarUri);
      
      // Verify the cached file exists before returning it
      try {
        if (FileSystem) {
          FileSystem.getInfoAsync(cachedAvatarUri).then(info => {
            if (!info.exists || !info.size || info.size < 100) {
              console.log('Cached file does not exist or is too small, will try to re-download');
              // Force re-download by clearing cache reference
              setCachedAvatarUri('');
              
              // Try to re-cache if we have an avatar URL
              if (profile?.avatar_url && !profile.avatar_url.startsWith('local-avatar://')) {
                console.log('Re-downloading avatar from:', profile.avatar_url);
                cacheAvatarImage(profile.avatar_url);
              }
            } else {
              console.log('Cached file verified:', info.size, 'bytes');
            }
          }).catch(err => {
            console.error('Error checking cached file:', err);
            setCachedAvatarUri('');
          });
        }
      } catch (e) {
        console.error('Exception checking cached file:', e);
      }
      
      // Use a file:// protocol URI which is more reliable on mobile
      return { uri: cachedAvatarUri };
    }
    
    // Then check for a preview URI stored in the profile
    if (profile?.avatar_preview_uri) {
      console.log('Using avatar preview URI:', profile.avatar_preview_uri);
      return { uri: profile.avatar_preview_uri };
    }
    
    // Then check for an avatar URL from the database
    if (profile?.avatar_url) {
      // Don't use local-avatar:// URLs as they aren't real
      if (profile.avatar_url.startsWith('local-avatar://')) {
        console.log('Using default avatar (local-avatar URL detected)');
        return require('../../../assets/images/default-avatar.png');
      }
      
      console.log('Using avatar URL from profile:', profile.avatar_url);
      
      // When using a remote URL, immediately start downloading it to avoid empty images
      if (!cachedAvatarUri && profile.avatar_url) {
        // Immediately attempt to download and cache the avatar
        console.log('No cached avatar available, initiating immediate download');
        
        (async () => {
          try {
            const avatarUrl = profile.avatar_url;
            // Skip if avatar URL is suddenly unavailable
            if (!avatarUrl) return;
            
            // Try optimized download first (our own implementation with high reliability)
            const localUri = await optimizedAvatarDownload(avatarUrl);
            if (localUri) {
              console.log('Optimized download successful:', localUri);
              setCachedAvatarUri(localUri);
              return;
            }
            
            // If that fails, try legacy download
            console.log('Optimized download failed, trying legacy download');
            const legacyUri = await downloadAvatarToLocal(avatarUrl);
            if (legacyUri) {
              console.log('Legacy download successful:', legacyUri);
              setCachedAvatarUri(legacyUri);
              return;
            }
            
            // If direct download fails, try the caching approach
            console.log('Direct downloads failed, trying cache approach');
            cacheAvatarImage(avatarUrl);
          } catch (error) {
            console.error('Error in immediate avatar download:', error);
          }
        })();
      }
      
      // Create a URL that will work with the Image component
      // We will add a cache-busting parameter to prevent stale images
      const timestamp = new Date().getTime();
      const cacheBustUrl = `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}t=${timestamp}`;
      
      // Return the URL - we'll use a fallback in the Image component if this fails
      return { uri: cacheBustUrl };
    }
    
    // Default fallback
    console.log('Using default avatar (no avatar in profile)');
    return require('../../../assets/images/default-avatar.png');
  };

  // New optimized download function that tries multiple approaches
  const optimizedAvatarDownload = async (avatarUrl: string) => {
    if (!avatarUrl || !FileSystem) return null;
    
    try {
      console.log('Starting optimized avatar download for:', avatarUrl);
      
      // Create a filename and paths
      const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const cacheDir = `${FileSystem.cacheDirectory}avatars/`;
      const localUri = `${cacheDir}${filename}`;
      
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      // Add cache-busting to URL
      const timestamp = Date.now();
      const downloadUrl = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
      
      // Try method 1: Using XMLHttpRequest (most reliable on React Native)
      try {
        console.log('Trying XMLHttpRequest download...');
        return await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          
          xhr.onload = async () => {
            if (xhr.status !== 200) {
              return reject(new Error(`HTTP error: ${xhr.status}`));
            }
            
            try {
              const blob = xhr.response;
              if (!blob || blob.size === 0) {
                return reject(new Error('Empty response'));
              }
              
              // Read as base64
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const base64data = reader.result?.toString().split(',')[1];
                  if (!base64data) {
                    return reject(new Error('Failed to convert to base64'));
                  }
                  
                  // Write file
                  await FileSystem.writeAsStringAsync(localUri, base64data, {
                    encoding: FileSystem.EncodingType.Base64,
                  });
                  
                  const fileInfo = await FileSystem.getInfoAsync(localUri);
                  if (!fileInfo.exists || fileInfo.size === 0) {
                    return reject(new Error('File not written properly'));
                  }
                  
                  console.log('XMLHttpRequest download successful:', fileInfo.size, 'bytes');
                  resolve(localUri);
                } catch (e) {
                  reject(e);
                }
              };
              reader.onerror = () => reject(new Error('FileReader error'));
              reader.readAsDataURL(blob);
            } catch (e) {
              reject(e);
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.onabort = () => reject(new Error('Download aborted'));
          xhr.ontimeout = () => reject(new Error('Download timed out'));
          
          xhr.open('GET', downloadUrl);
          xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          xhr.setRequestHeader('Pragma', 'no-cache');
          xhr.setRequestHeader('Expires', '0');
          xhr.send();
        });
      } catch (xhrError) {
        console.warn('XMLHttpRequest download failed:', xhrError);
      }
      
      // Try method 2: Using fetch with blob (fallback)
      try {
        console.log('Trying fetch with blob download...');
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Empty blob');
        }
        
        console.log('Fetch returned blob of size:', blob.size);
        
        // Convert blob to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data) {
              resolve(base64data);
            } else {
              reject(new Error('Failed to convert to base64'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        
        // Write the file
        await FileSystem.writeAsStringAsync(localUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists || fileInfo.size === 0) {
          throw new Error('File not written properly');
        }
        
        console.log('Fetch+blob download successful:', fileInfo.size, 'bytes');
        return localUri;
      } catch (fetchError) {
        console.warn('Fetch with blob download failed:', fetchError);
      }
      
      // Try method 3: Using Expo's downloadAsync as last resort
      try {
        console.log('Trying Expo FileSystem.downloadAsync...');
        const result = await FileSystem.downloadAsync(downloadUrl, localUri);
        
        if (result.status !== 200) {
          throw new Error(`Download failed with status: ${result.status}`);
        }
        
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists || fileInfo.size === 0) {
          throw new Error('Downloaded file is empty');
        }
        
        console.log('Expo downloadAsync successful:', fileInfo.size, 'bytes');
        return localUri;
      } catch (expoError) {
        console.warn('Expo FileSystem.downloadAsync failed:', expoError);
      }
      
      // All methods failed
      console.error('All download methods failed for avatar');
      return null;
    } catch (error) {
      console.error('Error in optimizedAvatarDownload:', error);
      return null;
    }
  };

  // Function to download and store the avatar locally for better reliability
  const downloadAvatarToLocal = async (avatarUrl: string | undefined | null) => {
    if (!avatarUrl || avatarUrl.startsWith('local-avatar://') || !FileSystem) {
      return null;
    }

    try {
      // Create a filename based on the URL but with a unique component
      const uniqueComponent = avatarUrl.split('/').pop() || `avatar-${Date.now()}.jpg`;
      const filename = `avatar-${Date.now()}-${uniqueComponent}`;
      const localUri = `${FileSystem.cacheDirectory}avatars/${filename}`;
      
      // Create directory if it doesn't exist
      const cacheDir = `${FileSystem.cacheDirectory}avatars/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      // Try direct fetch approach first (more reliable)
      try {
        console.log('Trying direct fetch for downloading avatar:', avatarUrl);
        
        // Use the direct download URL
        const downloadUrl = getDirectDownloadUrl(avatarUrl);
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (contentType && 
            !contentType.startsWith('image/') && 
            contentType !== 'application/octet-stream') {
          console.error('Invalid content type for avatar:', contentType);
          throw new Error(`Invalid content type: ${contentType}`);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('Downloaded blob is empty');
        }
        
        console.log('Avatar image fetched successfully, size:', blob.size);
        
        // Convert blob to base64
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              if (typeof reader.result === 'string') {
                // Remove the data URL prefix
                const base64Data = reader.result.split(',')[1];
                
                // Write the file
                await FileSystem.writeAsStringAsync(localUri, base64Data, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                
                const fileInfo = await FileSystem.getInfoAsync(localUri);
                console.log('File written successfully:', fileInfo);
                resolve(localUri);
      } else {
                reject(new Error('FileReader result is not a string'));
              }
            } catch (e) {
              reject(e);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        console.error('Direct fetch failed:', fetchError);
        
        // Fall back to original method if direct fetch fails
        console.log('Falling back to FileSystem.downloadAsync');
        const fileUri = `${FileSystem.cacheDirectory}avatars/${filename}`;
        const downloadUrl = `${avatarUrl}?t=${new Date().getTime()}`;
        await FileSystem.downloadAsync(downloadUrl, fileUri);
        
        return fileUri;
      }
    } catch (error) {
      console.error('Error in downloadAvatarToLocal:', error);
      return null;
    }
  };

  // Add a function to handle image loading errors with max retry limit
  const handleImageError = () => {
    console.error('Error loading profile image, using default avatar');
    
    // Stop infinite refresh loops by limiting retries
    const maxRetries = 2;
    const currentRetries = profile?.avatar_retry_count || 0;
    
    if (profile?.avatar_url && currentRetries < maxRetries) {
      // If we have an avatar URL but it failed to load, try to refresh it
      console.log('Avatar failed to load from URL:', profile.avatar_url, 'Attempt:', currentRetries + 1);
      
      // Clear cached values to force a fresh attempt
      setLocalImageUri('');
      setCachedAvatarUri('');
      
      // Try optimized download first, then fall back to other methods
      if (!profile.avatar_url.startsWith('local-avatar://')) {
        console.log('Attempting optimized download after error');
        
        (async () => {
          try {
            const avatarUrl = profile.avatar_url;
            // Skip if avatar URL is suddenly unavailable
            if (!avatarUrl) return;
            
            // Try our most reliable method first
            const localUri = await optimizedAvatarDownload(avatarUrl);
          if (localUri) {
              console.log('Successful optimized download after error:', localUri);
            setCachedAvatarUri(localUri);
            
            // Update profile with retry count
            if (profile) {
              setProfile({
                ...profile,
                avatar_retry_count: currentRetries + 1
              });
            }
              return;
            }
            
            // If that fails, try fallback methods
            console.log('Failed retry with optimized download, trying alternatives');
            
            // Try refreshing the profile as a last resort
            refreshProfile().then(refreshedProfile => {
              if (refreshedProfile?.avatar_url) {
                console.log('Profile refreshed, new avatar URL:', refreshedProfile.avatar_url);
                
                // Update retry count to prevent infinite loops
                setProfile({
                  ...refreshedProfile,
                  avatar_retry_count: currentRetries + 1
                });
                
                // Try to cache again with the fresh URL
                cacheAvatarImage(refreshedProfile.avatar_url);
              } else {
                // Profile refresh didn't provide a valid avatar URL
                if (currentRetries + 1 >= maxRetries) {
                  Toast.show({
                    type: 'error',
                    text1: 'Image Load Error',
                    text2: 'Could not load profile picture'
                  });
                }
              }
            });
          } catch (error) {
            console.error('Error in error recovery process:', error);
          }
        })();
      } else {
        // Local avatar URL that failed
        if (currentRetries + 1 >= maxRetries) {
          Toast.show({
            type: 'error',
            text1: 'Image Load Error',
            text2: 'Could not load profile picture'
          });
        }
        
        // Update profile with retry count
        if (profile) {
          setProfile({
            ...profile,
            avatar_retry_count: currentRetries + 1
          });
        }
      }
    } else {
      // We've exhausted retries or don't have a URL, use default avatar
      if (profile && profile.avatar_url) {
        console.log('Max retries reached, using default avatar');
        setProfile({
          ...profile,
          avatar_url: null,  // Clear the avatar URL so we don't keep trying
          avatar_retry_count: 0  // Reset retry count
        });
      }
    }
  };

  const renderViewProfile = () => (
    <View style={styles.profileViewContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarContainer}>
            <Image
              source={getAvatarSource()}
              style={styles.profileAvatar}
            onError={(e) => {
              console.log('PROFILE IMAGE LOAD ERROR:', e.nativeEvent);
              console.log('PROFILE IMAGE ERROR URL:', 
                getAvatarSource().uri ? getAvatarSource().uri : 'default-image');
              handleImageError();
            }}
            onLoad={() => {
              console.log('PROFILE IMAGE LOAD SUCCESS!');
            }}
              defaultSource={require('../../../assets/images/default-avatar.png')}
              fadeDuration={300}
              progressiveRenderingEnabled={true}
            />
        </View>
        
        <Text style={styles.profileName}>{fullName || 'User'}</Text>
        
        {profile?.role && (
          <View style={[styles.roleBadge, 
            profile.role === 'ADMIN' ? styles.adminBadge : 
            profile.role === 'PREMIUM' ? styles.premiumBadge : styles.userBadge
          ]}>
            <Text style={styles.roleText}>{profile.role}</Text>
          </View>
        )}
        
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>122</Text>
            <Text style={styles.statLabel}>followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>67</Text>
            <Text style={styles.statLabel}>following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>37K</Text>
            <Text style={styles.statLabel}>likes</Text>
          </View>
        </View>
        
        <View style={styles.levelContainer}>
          <View style={styles.levelTextContainer}>
            <Text style={[styles.levelValue, { color: theme.textColor }]}>Level 14</Text>
            <Text style={[styles.levelPoints, { color: theme.secondaryColor }]}>3,240 / 4,000 XP</Text>
          </View>
          <View style={[styles.levelProgressContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={[styles.levelProgressBar, { backgroundColor: theme.primaryColor, width: `${(3240/4000) * 100}%` }]} />
          </View>
        </View>
      </View>
      
      <View style={styles.profileContent}>
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bio</Text>
            <Text style={styles.bioText}>{bio || 'No bio provided'}</Text>
          </Card.Content>
        </Card>
        
        {/* Achievement Badge Component */}
        <TouchableOpacity 
          style={styles.achievementsButton}
          onPress={() => navigation.navigate('Achievements' as never)}
        >
          <AchievementBadges userId={user?.id || ''} />
          <View style={styles.achievementsArrow}>
            <Icon name="chevron-right" size={24} color={theme.primaryColor} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.profileActions}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEditProfile = () => (
    <ScrollView style={styles.editProfileContainer}>
      <View style={styles.editHeader}>
        <IconButton
          icon="arrow-left"
          iconColor="#6200ee"
          size={24}
          onPress={() => setEditing(false)}
        />
        <Text style={styles.editTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.editAvatarContainer}>
        <TouchableOpacity onPress={pickImage} disabled={isUploading}>
            <Image
              source={getAvatarSource()}
              style={styles.avatar}
            onError={(e) => {
              console.log('AVATAR IMAGE LOAD ERROR:', e.nativeEvent);
              console.log('AVATAR IMAGE ERROR URL:', getAvatarSource().uri);
              handleImageError();
            }}
            onLoad={() => {
              console.log('AVATAR IMAGE LOAD SUCCESS!');
            }}
              defaultSource={require('../../../assets/images/default-avatar.png')}
              fadeDuration={300}
              progressiveRenderingEnabled={true}
            />
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Icon name="edit-2" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHelpText}>Tap to change profile picture</Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user?.email || ''}
            editable={false}
            mode="outlined"
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            mode="outlined"
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setEditing(false)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderThemeSelector = () => {
  return (
      <>
        <Card style={[styles.profileCard, { backgroundColor: theme.cardColor }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.textColor }]}>Theme Settings</Text>
            
            <View style={styles.themeSystemSection}>
              <Text style={[styles.themeSettingTitle, { color: theme.textColor }]}>
                Follow System Appearance
              </Text>
              <Switch
                value={useSystemTheme}
                onValueChange={setUseSystemTheme}
                trackColor={{ false: '#767577', true: theme.primaryColor }}
                thumbColor={useSystemTheme ? theme.primaryColor : '#f4f3f4'}
              />
            </View>
            
            <Text style={[styles.themeOptionHeader, { color: theme.textColor }]}>
              {useSystemTheme ? 'Accent Color' : 'App Theme'}
            </Text>

            <View style={styles.themesContainer}>
              {/* Theme color options */}
              {Object.entries(accentThemes).map(([key, themeValue]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeOption,
                    { backgroundColor: themeValue.primaryColor },
                    accentKey === key && styles.selectedTheme,
                  ]}
                  onPress={() => setAccentKey(key as AccentKey)}
                >
                  <View style={styles.themeIconContainer}>
                    {key === 'purple' && <Icon name="zap" size={18} color="white" />}
                    {key === 'blue' && <Icon name="droplet" size={18} color="white" />}
                    {key === 'green' && <Icon name="feather" size={18} color="white" />}
                    {key === 'orange' && <Icon name="sun" size={18} color="white" />}
                    {key === 'pink' && <Icon name="heart" size={18} color="white" />}
                  </View>
                  <Text style={styles.themeOptionText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  {accentKey === key && (
                    <View style={styles.themeCheckmark}>
                      <Icon name="check" size={14} color="white" />
        </View>
      )}
                </TouchableOpacity>
              ))}
            </View>

            {!useSystemTheme && (
              <View style={styles.darkModeContainer}>
                <Text style={[styles.themeSettingTitle, { color: theme.textColor }]}>
                  Dark Mode
                </Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={(value) => {
                    // This is just a proxy - we're actually setting the accent to force dark mode
                    if (value) {
                      // Dark mode
                      setUseSystemTheme(false);
                    } else {
                      // Light mode
                      setUseSystemTheme(false);
                    }
                  }}
                  trackColor={{ false: '#767577', true: theme.primaryColor }}
                  thumbColor={isDarkMode ? theme.primaryColor : '#f4f3f4'}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.profileCard, { backgroundColor: theme.cardColor, marginTop: 16 }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.textColor }]}>Profile Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => {
                setShowSettingsModal(false);
                setEditing(true);
              }}
            >
              <View style={styles.settingsButtonContent}>
                <Icon name="user" size={20} color={theme.primaryColor} style={styles.settingsButtonIcon} />
                <Text style={[styles.settingsButtonText, { color: theme.textColor }]}>Edit Profile Information</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.primaryColor} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => {
                setShowSettingsModal(false);
                setShowNotificationsModal(true);
              }}
            >
              <View style={styles.settingsButtonContent}>
                <Icon name="bell" size={20} color={theme.primaryColor} style={styles.settingsButtonIcon} />
                <Text style={[styles.settingsButtonText, { color: theme.textColor }]}>Notification Preferences</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.primaryColor} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </>
    );
  };

  const renderSettingsModal = () => {
    return (
        <Modal
          visible={showSettingsModal}
          onDismiss={() => setShowSettingsModal(false)}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.backgroundColor || '#fff' }
        ]}
      >
        <ScrollView>
          <Text style={[styles.modalTitle, { color: theme.primaryColor || '#6200ee' }]}>Settings</Text>
          
          <Card style={[styles.settingsCard, { backgroundColor: theme.cardColor || '#fff' }]}>
            <Card.Title 
              title="Theme Settings" 
              titleStyle={{ color: theme.textColor || '#333' }}
            />
            <Card.Content>
              <View style={styles.themeGrid}>
                {Object.entries(accentThemes).map(([key, color]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.themeOption,
                      { backgroundColor: color.primaryColor },
                      accentKey === key && styles.selectedThemeOption
                    ]}
                    onPress={() => setAccentKey(key as AccentKey)}
                  >
                    {accentKey === key && (
                      <Icon name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
          
          <Card style={[styles.settingsCard, { backgroundColor: theme.cardColor || '#fff' }]}>
            <Card.Content>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingTitle, { color: theme.textColor || '#333' }]}>Use System Theme</Text>
                <Switch
                  value={useSystemTheme}
                  onValueChange={setUseSystemTheme}
                  color={theme.primaryColor || '#6200ee'}
                />
              </View>
            </Card.Content>
          </Card>
          
          <Card style={[styles.settingsCard, { backgroundColor: theme.cardColor || '#fff', marginTop: 10 }]}>
            <Card.Title 
              title="Profile Settings" 
              titleStyle={{ color: theme.textColor || '#333' }}
            />
            <Card.Content>
              <View style={styles.profileSettingsButtons}>
                <TouchableOpacity 
                  style={[styles.settingsButton, { backgroundColor: theme.primaryColor + '20' || '#6200ee20' }]}
                  onPress={() => {
                    setShowSettingsModal(false);
                    setEditing(true);
                  }}
                >
                  <Icon name="user" size={20} color={theme.primaryColor || '#6200ee'} style={styles.settingsButtonIcon} />
                  <Text style={[styles.settingsButtonText, { color: theme.primaryColor || '#6200ee' }]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.settingsButton, { backgroundColor: theme.primaryColor + '20' || '#6200ee20' }]}
                  onPress={() => {
                    setShowSettingsModal(false);
                    setShowNotificationsModal(true);
                  }}
                >
                  <Icon name="bell" size={20} color={theme.primaryColor || '#6200ee'} style={styles.settingsButtonIcon} />
                  <Text style={[styles.settingsButtonText, { color: theme.primaryColor || '#6200ee' }]}>
                    Notifications
                  </Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
          
          <Button
            mode="outlined"
            onPress={() => setShowSettingsModal(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={[styles.modalButton, styles.logoutButton]}
            textColor={theme.accentColor || '#f44336'}
            icon="logout"
          >
            Sign Out
          </Button>
        </ScrollView>
        </Modal>
    );
  };
        
  const renderNotificationsModal = () => {
    return (
        <Modal
          visible={showNotificationsModal}
          onDismiss={() => setShowNotificationsModal(false)}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.backgroundColor || '#fff' }
        ]}
        >
        <ScrollView>
          <Text style={[styles.modalTitle, { color: theme.primaryColor || '#6200ee' }]}>Notification Settings</Text>
          <Card style={[styles.settingsCard, { backgroundColor: theme.cardColor || '#fff' }]}>
            <Card.Content>
          <NotificationSettings
            onSettingsChange={handleNotificationSettingsChange}
          />
            </Card.Content>
          </Card>
          <Button
            mode="outlined"
            onPress={() => setShowNotificationsModal(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </ScrollView>
        </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <AppHeader
        title="Profile"
        username={profile?.full_name || 'User'}
        avatarUrl={profile?.avatar_url || undefined}
        userRole={profile?.role || 'USER'}
        showSettingsButton
        showNotificationsButton
        onSettingsPress={handleSettingsPress}
        onNotificationsPress={handleNotificationsPress}
      />
      
      {editing ? renderEditProfile() : renderViewProfile()}
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
        </View>
      )}
      
      <Portal>
        {renderSettingsModal()}
        
        {renderNotificationsModal()}
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  // View Profile Styles
  profileViewContainer: {
    flex: 1,
  },
  profileHeader: {
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  profileAvatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  bioText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  profileActions: {
    marginTop: 20,
  },
  
  // Achievements styles
  achievementsButton: {
    position: 'relative', 
    marginVertical: 16,
  },
  achievementsArrow: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -12,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  
  // Edit Profile Styles
  editProfileContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  // Shared Styles
  placeholderAvatar: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#555',
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  input: {
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginVertical: 8,
  },
  adminBadge: {
    backgroundColor: '#FF5733',
  },
  premiumBadge: {
    backgroundColor: '#DAA520',
  },
  userBadge: {
    backgroundColor: '#3498DB',
  },
  roleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  avatarHelpText: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  closeButton: {
    marginTop: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  themeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  themeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeName: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  themeOptionText: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  themeCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeSystemSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  themeSettingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeOptionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  darkModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    flex: 0.48,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonIcon: {
    marginRight: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelContainer: {
    width: '80%',
    marginBottom: 20,
  },
  levelTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelPoints: {
    fontSize: 14,
  },
  levelProgressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressBar: {
    height: '100%',
    width: '81%', // Default value that will be overwritten
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  selectedThemeOption: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileSettingsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 