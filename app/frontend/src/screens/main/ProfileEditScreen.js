import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { userAPI } from '../../services/api';

/**
 * ProfileEditScreen - Allows users to edit their profile information
 */
const ProfileEditScreen = ({ navigation }) => {
  const { user, profile, updateProfile, refreshUser } = useAuth();
  const { accent } = useTheme();
  const accentColor = accent || '#E67E22';
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Initial form state based on user data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    display_name: '',
    bio: '',
    notifications: true,
  });
  
  // Load user data
  useEffect(() => {
    if (user && profile) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        notifications: true, // Default to true since it's not in the profile yet
      });
    }
  }, [user, profile]);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  // Save profile changes
  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare data for API
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      const profileData = {
        display_name: formData.display_name,
        bio: formData.bio
      };
      
      // Update profile using AuthContext
      const success = await updateProfile({ ...userData, profile: profileData });
      
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Change profile picture
  const handleChangeProfilePicture = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to change your profile picture.'
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  // Upload profile picture
  const uploadProfilePicture = async (imageUri) => {
    setImageLoading(true);
    try {
      console.log('Starting profile picture upload:', imageUri);
      
      const result = await userAPI.uploadProfilePicture(imageUri);
      console.log('Upload successful, response:', result);
      
      await refreshUser(); // Refresh user data to get updated avatar
      console.log('User data refreshed, new profile:', profile);
      
      Alert.alert('Success', 'Profile picture updated successfully.');
    } catch (error) {
      console.log('Error uploading image:', error);
      console.log('Error details:', error.response?.data || 'No response data');
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          {imageLoading ? (
            <View style={styles.avatarLoading}>
              <ActivityIndicator size="large" color={accentColor} />
            </View>
          ) : (
            <Image 
              source={
                profile && profile.avatar 
                  ? { uri: profile.avatar } 
                  : require('../../assets/images/default-avatar.png')
              }
              style={styles.avatar}
            />
          )}
          <TouchableOpacity 
            style={styles.changePictureButton}
            onPress={handleChangeProfilePicture}
          >
            <Ionicons name="camera" size={18} color="#fff" style={styles.cameraIcon} />
            <Text style={styles.changePictureText}>Change Profile Picture</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.first_name}
              onChangeText={(text) => handleChange('first_name', text)}
              placeholderTextColor="#999"
              placeholder="Enter your first name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(text) => handleChange('last_name', text)}
              placeholderTextColor="#999"
              placeholder="Enter your last name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={formData.display_name}
              onChangeText={(text) => handleChange('display_name', text)}
              placeholderTextColor="#999"
              placeholder="Enter your display name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              placeholderTextColor="#999"
              placeholder="Enter your username"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholderTextColor="#999"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              placeholderTextColor="#999"
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
        
        {/* Preferences Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Switch
              trackColor={{ false: '#333', true: '#E67E22' }}
              thumbColor={formData.notifications ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#333"
              onValueChange={(value) => handleChange('notifications', value)}
              value={formData.notifications}
            />
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: accentColor }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    marginBottom: 15,
  },
  avatarLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  cameraIcon: {
    marginRight: 8,
  },
  changePictureText: {
    color: '#E67E22',
    fontWeight: 'bold',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileEditScreen; 