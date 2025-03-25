import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, ImageBackground, Platform } from 'react-native';
import { Button, TextInput, Avatar, Divider, Card, IconButton } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';
import { UserProfile } from '../../hooks/useAuth';
import * as FileSystem from 'expo-file-system';

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile, updateAvatar, refreshProfile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [initComplete, setInitComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState('');
  const [cachedAvatarUri, setCachedAvatarUri] = useState('');

  // Automatically run fixDatabaseIssues when the component mounts
  useEffect(() => {
    const initializeProfile = async () => {
      if (user && !initComplete) {
        setLoading(true);
        try {
          console.log('Auto-running database fixes on profile load');
          await fixDatabaseIssues(false); // Don't show toast for auto-run
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

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const fixDatabaseIssues = async (showToast = true) => {
    setLoading(true);
    try {
      // Try to reset policies
      const { data: resetData, error: resetError } = await supabase.rpc('reset_profile_policies');
      if (resetError) {
        console.error('Error resetting policies:', resetError);
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: 'Error resetting policies',
            text2: resetError.message
          });
        }
      } else {
        console.log('Policies reset:', resetData);
      }

      // Try to fix any missing profiles
      const { data: fixData, error: fixError } = await supabase.rpc('fix_missing_profiles');
      if (fixError) {
        console.error('Error fixing profiles:', fixError);
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: 'Error fixing profiles',
            text2: fixError.message
          });
        }
      } else {
        console.log('Fixed profiles count:', fixData);
      }

      // Check storage permissions
      const { data: storageData, error: storageError } = await supabase.rpc('test_storage_permissions');
      if (storageError) {
        console.error('Error testing storage:', storageError);
      } else {
        console.log('Storage permissions:', storageData);
      }

      // Test profile permissions
      if (user && user.email) {
        try {
          const { data: profileData, error: profileError } = await supabase.rpc('test_profile_permissions', {
            user_email: user.email
          });
          
          if (profileError) {
            console.error('Error testing profile permissions:', profileError);
          } else {
            console.log('Profile permissions:', profileData);
          }
        } catch (error) {
          console.error('Error in profile permissions check:', error);
        }
      }
      
      // Update MIME type settings for avatars bucket
      try {
        const { error: mimeError } = await supabase.rpc('update_avatars_mime_types', {
          mime_types: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });
        
        if (mimeError) {
          console.error('Error updating MIME types:', mimeError);
        } else {
          console.log('Updated MIME types for avatars bucket');
        }
      } catch (mimeError) {
        console.error('Exception updating MIME types:', mimeError);
      }
      
      // Force profile refresh
      if (refreshProfile) {
        // Force a complete refresh to get latest data
        const refreshedProfile = await refreshProfile();
        
        // Update local state with current profile data
        if (refreshedProfile) {
          setFullName(refreshedProfile.full_name || '');
          setBio(refreshedProfile.bio || '');
        }
        
        // Only show toast if explicitly requested (not for auto-run)
        if (showToast) {
          Toast.show({
            type: 'success',
            text1: 'Profile refreshed',
            text2: 'Latest profile data has been loaded'
          });
        }
      }
      
    } catch (error) {
      console.error('Error fixing database:', error);
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: 'Error fixing database',
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
      // First try using standard updateProfile
      console.log('Updating profile with:', { full_name: fullName, bio });
      const { data, error } = await updateProfile({
        full_name: fullName,
        bio,
      });
      
      if (error) {
        console.error('Error updating profile via standard method:', error);
        
        // Try via direct RPC function
        console.log('Trying via RPC function...');
        const success = await updateProfileViaRPC({ fullName, bio });
        
        if (!success) {
          Toast.show({
            type: 'error',
            text1: 'Error updating profile',
            text2: 'Failed to update profile. Try restarting the app.'
          });
        } else {
          // Successfully updated, exit edit mode
          setEditing(false);
        }
      } else {
        console.log('Profile updated successfully via standard method:', data);
        Toast.show({
          type: 'success',
          text1: 'Profile updated',
          text2: 'Your profile has been updated successfully'
        });
        
        // Explicitly refresh the form values from the updated profile
        if (profile) {
          setFullName(profile.full_name || '');
          setBio(profile.bio || '');
        }
        
        // Exit edit mode
        setEditing(false);
      }
    } catch (error) {
      console.error('Exception in handleSaveChanges:', error);
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
      
      // Check if file already exists in cache
      const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
      if (fileInfo.exists) {
        console.log('Using cached avatar:', cacheFilePath);
        setCachedAvatarUri(cacheFilePath);
        return;
      }
      
      // Download and cache the file
      console.log('Downloading avatar to cache:', imageUrl);
      const { uri } = await FileSystem.downloadAsync(imageUrl, cacheFilePath);
      console.log('Avatar cached at:', uri);
      setCachedAvatarUri(uri);
    } catch (error) {
      console.error('Error caching avatar image:', error);
    }
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
      // Add a cache buster to prevent using cached version from previous failures
      // and set a max width to reduce bandwidth and improve load times
      return { uri: `${profile.avatar_url}?t=${Date.now()}&width=300` };
    }
    
    // Default fallback
    console.log('Using default avatar (no avatar in profile)');
    return require('../../../assets/images/default-avatar.png');
  };

  // Function to download and store the avatar locally for better reliability
  const downloadAvatarToLocal = async (avatarUrl: string) => {
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
      
      // Add a cache buster to the URL
      const downloadUrl = `${avatarUrl}?t=${Date.now()}`;
      
      console.log('Downloading avatar directly to local file:', downloadUrl);
      const result = await FileSystem.downloadAsync(downloadUrl, localUri);
      
      if (result.status === 200) {
        console.log('Avatar downloaded successfully to:', localUri);
        return localUri;
      } else {
        console.error('Failed to download avatar, status:', result.status);
        return null;
      }
    } catch (error) {
      console.error('Error downloading avatar:', error);
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
      
      // If this is the first error, try to refresh the profile
      if (!profile.avatar_url.startsWith('local-avatar://')) {
        console.log('Attempting to refresh profile data to fix avatar');
        
        // Try to download the avatar directly
        downloadAvatarToLocal(profile.avatar_url).then(localUri => {
          if (localUri) {
            console.log('Successfully downloaded avatar to local file:', localUri);
            setCachedAvatarUri(localUri);
            
            // Update profile with retry count
            if (profile) {
              setProfile({
                ...profile,
                avatar_retry_count: currentRetries + 1
              });
            }
          } else {
            console.log('Failed to download avatar, falling back to profile refresh');
            
            // Fall back to refreshing the profile data
            refreshProfile().then(refreshedProfile => {
              if (refreshedProfile?.avatar_url) {
                console.log('Profile refreshed, new avatar URL:', refreshedProfile.avatar_url);
                
                // Update retry count to prevent infinite loops
                setProfile({
                  ...refreshedProfile,
                  avatar_retry_count: currentRetries + 1
                });
                
                // Try to cache the new URL
                cacheAvatarImage(refreshedProfile.avatar_url);
              } else {
                console.log('Profile refresh did not return a valid avatar URL');
                
                // Show error to user only after exhausting retries
                if (currentRetries + 1 >= maxRetries) {
                  Toast.show({
                    type: 'error',
                    text1: 'Image Load Error',
                    text2: 'Could not load profile picture'
                  });
                }
              }
            });
          }
        });
      } else {
        // Only show toast on final retry
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
      <ImageBackground
        source={require('../../../assets/images/profile-background.png')}
        style={styles.profileHeader}
      >
        <View style={styles.profileAvatarContainer}>
          {getAvatarSource() ? (
            <Image
              source={getAvatarSource()}
              style={styles.profileAvatar}
              onError={handleImageError}
              defaultSource={require('../../../assets/images/default-avatar.png')}
              fadeDuration={300}
              progressiveRenderingEnabled={true}
            />
          ) : (
            <View style={[styles.profileAvatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>
                {fullName ? fullName.substring(0, 2).toUpperCase() : "👤"}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.profileName}>{fullName}</Text>
        
        {profile?.role && (
          <View style={[styles.roleBadge, 
            profile.role === 'ADMIN' ? styles.adminBadge : 
            profile.role === 'PREMIUM' ? styles.premiumBadge : styles.userBadge
          ]}>
            <Text style={styles.roleText}>{profile.role}</Text>
          </View>
        )}
        
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </ImageBackground>
      
      <View style={styles.profileContent}>
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.bioText}>{bio || 'No bio provided'}</Text>
          </Card.Content>
        </Card>
        
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
          {getAvatarSource() ? (
            <Image
              source={getAvatarSource()}
              style={styles.avatar}
              onError={handleImageError}
              defaultSource={require('../../../assets/images/default-avatar.png')}
              fadeDuration={300}
              progressiveRenderingEnabled={true}
            />
          ) : (
            <Avatar.Text 
              size={80} 
              label={profile?.full_name?.substring(0, 2) || '??'} 
            />
          )}
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

  return (
    <SafeAreaView style={styles.container}>
      {editing ? renderEditProfile() : renderViewProfile()}
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}
    </SafeAreaView>
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
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#6200ee',
  },
  profileAvatarContainer: {
    marginBottom: 10,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: 20,
    paddingHorizontal: 20,
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
    fontSize: 12,
    color: '#777',
  },
  profileActions: {
    marginTop: 10,
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
}); 