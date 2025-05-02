import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Text,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../../contexts/AuthContext';
import { colors } from '../../constants/theme';
import apiConfig from '../../config/apiConfig';
import { uploadProfilePicture } from '../../services/profileService';

const { width } = Dimensions.get('window');
const API_URL = apiConfig.apiUrl;

/**
 * ProfilePicture Component
 * 
 * A component for displaying and updating user profile pictures.
 * - Handles image selection from gallery or camera
 * - Displays the profile picture with the option to expand it
 * - Provides UI for updating the profile picture
 * - Falls back to default avatar when no picture is set
 */
const ProfilePicture = ({ size = width * 0.2, editable = true, onImageUpdated = () => {} }) => {
  const { user, userToken, setUser } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localProfilePicture, setLocalProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  // Set local state from user when it changes
  useEffect(() => {
    // Check if user object exists and has a profile picture
    if (user && user.profile_picture) {
      console.log('Setting profile picture from user data:', user.profile_picture);
      setLocalProfilePicture(user.profile_picture);
      setImageError(false);
    }
  }, [user]);

  // Add a component mounted effect for debugging
  useEffect(() => {
    if (__DEV__) {
      console.log('ProfilePicture component mounted with user:', user?.username);
      console.log('Has profile picture:', !!user?.profile_picture);
      
      // Check if we have a complete user object
      if (user) {
        const userKeys = Object.keys(user);
        console.log('User object keys:', userKeys);
      }
    }
    
    return () => {
      if (__DEV__) {
        console.log('ProfilePicture component unmounted');
      }
    };
  }, []);

  // Get profile picture URL or use default avatar
  const getProfilePictureSource = () => {
    // Determine which picture source to use (local state or user data)
    const pictureSource = localProfilePicture || user?.profile_picture;
    
    // If no picture or error loading, use default avatar
    if (!pictureSource || imageError) {
      if (__DEV__) console.log('Using default avatar (no source or error)');
      return require('../../../assets/default-avatar.png');
    }
    
    // For HTTP/HTTPS URLs, use them directly
    if (pictureSource.startsWith('http')) {
      if (__DEV__) console.log('Using full URL for profile picture:', pictureSource);
      return { uri: pictureSource };
    }
    
    // For relative paths, construct with API URL
    const fullUri = `${API_URL}${pictureSource.startsWith('/') ? '' : '/'}${pictureSource}`;
    if (__DEV__) console.log('Using constructed URL for profile picture:', fullUri);
    
    return { uri: fullUri };
  };
  
  // Print debug info in development mode
  if (__DEV__ && localProfilePicture) {
    console.log('Profile picture data:', {
      localProfilePicture,
      source: getProfilePictureSource()
    });
  }

  // Request camera/photo library permissions
  const requestPermissions = async (type) => {
    if (Platform.OS !== 'web') {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed', 
            'We need camera permissions to take a photo'
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed', 
            'We need library permissions to select a photo'
          );
          return false;
        }
      }
      return true;
    }
    return false;
  };

  // Handle selecting image from gallery
  const handleSelectImage = async () => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        processAndUploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Unable to select image.');
    }
  };

  // Handle taking a photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        processAndUploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Unable to take photo.');
    }
  };

  // Helper function to get token if needed
  const getToken = async () => {
    if (userToken) return userToken;
    return await SecureStore.getItemAsync('userToken');
  };

  // Process and upload the image to the server
  const processAndUploadImage = async (imageUri) => {
    setIsUpdating(true);
    try {
      // Resize and compress the image
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Create form data for upload
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: processedImage.uri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      });

      // Get the token if needed
      const token = await getToken();
      
      // Upload to server using our service
      const response = await uploadProfilePicture(formData, token);
      console.log('Upload response:', response);

      // Update user data with new profile picture
      if (response.success) {
        // Update local state first for immediate feedback
        setLocalProfilePicture(response.profilePicture);
        setImageError(false);
        
        // Update local user data
        const updatedUser = {
          ...user,
          profile_picture: response.profilePicture,
        };
        
        // Log the updated user object
        console.log('Updating user with new profile picture:', updatedUser.profile_picture);
        
        // Update context and secure storage
        await setUser(updatedUser);
        
        // Close modal and notify parent
        setModalVisible(false);
        onImageUpdated(response.profilePicture);
        
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        // Handle unsuccessful response
        console.error('Failed to update profile picture:', response);
        Alert.alert('Upload Failed', response.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert(
        'Upload Failed', 
        'Unable to upload profile picture. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle image load error
  const handleImageError = (error) => {
    console.warn('Failed to load profile image, using default avatar', error);
    console.log('Error source URI:', getProfilePictureSource().uri);
    setImageError(true);
  };

  // Add a press effect for better feedback
  const handlePressIn = () => {
    if (editable) {
      setIsPressed(true);
    }
  };
  
  const handlePressOut = () => {
    if (editable) {
      setIsPressed(false);
    }
  };

  return (
    <>
      {/* Profile Picture */}
      <TouchableOpacity 
        style={[
          styles.profileImageContainer, 
          { width: size, height: size },
          editable && styles.editableImage,
          isPressed && styles.pressedImage
        ]}
        onPress={() => setModalVisible(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!editable}
        activeOpacity={editable ? 0.7 : 1}
      >
        <Image 
          source={getProfilePictureSource()}
          style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          onError={handleImageError}
        />
        
        {/* Subtle edit indicator */}
        {editable && isPressed && (
          <View style={styles.editIndicator}>
            <Ionicons name="camera" size={size * 0.12} color={colors.background} />
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Picture Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              {/* Large Profile Picture View */}
              <View style={styles.imagePreviewContainer}>
                {isUpdating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Uploading...</Text>
                  </View>
                ) : (
                  <Image 
                    source={getProfilePictureSource()}
                    style={styles.largeProfileImage}
                    resizeMode="contain"
                    onError={handleImageError}
                  />
                )}
              </View>
              
              {/* Action Buttons - only show if editable */}
              {editable && (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.actionButton, isUpdating && styles.disabledButton]}
                    onPress={handleTakePhoto}
                    disabled={isUpdating}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.text.primary} />
                    <Text style={styles.actionButtonText}>Camera</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, isUpdating && styles.disabledButton]}
                    onPress={handleSelectImage}
                    disabled={isUpdating}
                  >
                    <Ionicons name="image-outline" size={24} color={colors.text.primary} />
                    <Text style={styles.actionButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Close Button */}
              <TouchableOpacity 
                style={[styles.closeButton, isUpdating && styles.disabledButton]}
                onPress={() => setModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#D8D0BA',
    borderRadius: 100, // Make container circular
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  editableImage: {
    // Remove border color to make it cleaner
  },
  pressedImage: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#D8D0BA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeProfileImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    width: '45%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 14,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    width: '100%',
  },
  closeButtonText: {
    color: colors.text.inverted,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  editIndicator: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 2,
    borderRadius: 8,
    opacity: 0.7,
    width: '22%',
    height: '22%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfilePicture; 