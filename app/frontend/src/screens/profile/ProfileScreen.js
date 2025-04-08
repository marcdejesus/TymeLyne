import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { userAPI } from '../../services/api';

/**
 * ProfileScreen - Allows users to view and edit their profile
 */
const ProfileScreen = ({ navigation }) => {
  const { user, profile, loading: authLoading, updateProfile, refreshUser, logout } = useAuth();
  const { accent, theme } = useTheme();
  const accentColor = accent || '#FF9500';
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
  });
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: profile?.display_name || '',
        bio: profile?.bio || '',
      });
    }
  }, [user, profile]);
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Image picker function
  const pickImage = async () => {
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
    setLoading(true);
    try {
      await userAPI.uploadProfilePicture(imageUri);
      refreshUser(); // Refresh user data to get updated avatar
      Alert.alert('Success', 'Profile picture updated successfully.');
    } catch (error) {
      console.log('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Save profile changes
  const saveChanges = async () => {
    setLoading(true);
    setError(null);
    
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
      
      // Update profile
      const success = await updateProfile({ ...userData, profile: profileData });
      
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
      }
    } catch (error) {
      console.log('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };
  
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? saveChanges() : setIsEditing(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <Text style={[styles.editButtonText, { color: accentColor }]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ff3b30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: accentColor + '40' }]}>
              <Ionicons name="person" size={60} color={accentColor} />
            </View>
          )}
          
          {isEditing && (
            <TouchableOpacity 
              style={[styles.changePhotoButton, { backgroundColor: accentColor }]}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={18} color="white" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Stats Section */}
        {!isEditing && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.level || 0}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.xp || 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.days_streak || 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        )}
        
        {/* Profile Form */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              editable={isEditing}
              placeholder="Username"
              placeholderTextColor="#777"
            />
          </View>
          
          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              editable={isEditing}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#777"
            />
          </View>
          
          {/* Display Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.display_name}
              onChangeText={(text) => handleChange('display_name', text)}
              editable={isEditing}
              placeholder="Display Name"
              placeholderTextColor="#777"
            />
          </View>
          
          {/* First Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.first_name}
              onChangeText={(text) => handleChange('first_name', text)}
              editable={isEditing}
              placeholder="First Name"
              placeholderTextColor="#777"
            />
          </View>
          
          {/* Last Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.last_name}
              onChangeText={(text) => handleChange('last_name', text)}
              editable={isEditing}
              placeholder="Last Name"
              placeholderTextColor="#777"
            />
          </View>
          
          {/* Bio */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, !isEditing && styles.disabledInput]}
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              editable={isEditing}
              placeholder="Tell us about yourself"
              placeholderTextColor="#777"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#ff3b30' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#ff3b30" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  changePhotoText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  formContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.7,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  logoutButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen; 