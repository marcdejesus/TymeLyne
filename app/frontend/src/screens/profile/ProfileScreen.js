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
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { userAPI, achievementAPI, courseAPI } from '../../services/api';
import AchievementCard from '../../components/achievements/AchievementCard';
import { useNavigation, CommonActions } from '@react-navigation/native';

/**
 * ProfileScreen - Displays user profile with an Instagram-like layout focusing on achievements
 * 
 * @param {Object} navigation - Navigation object for navigating between screens
 */
const ProfileScreen = ({ navigation, route }) => {
  const { user, profile, loading: authLoading, updateProfile, refreshUser, logout } = useAuth();
  const { accent, theme, current } = useTheme();
  const accentColor = accent || '#FF9500';
  const [menuVisible, setMenuVisible] = useState(false);
  
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
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('completed');
  const [userStats, setUserStats] = useState({
    totalAchievements: 0,
    completedAchievements: 0,
    coursesCompleted: 0,
    friendsCount: 0
  });
  
  // Load user data and achievements when component mounts
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        display_name: profile.display_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
      });
    }
    
    fetchUserData();
  }, [profile]);
  
  // Format user's full name
  const getFullName = () => {
    if (!user) return 'User';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.profile && user.profile.display_name) {
      return user.profile.display_name;
    } else {
      return user.username || 'User';
    }
  };
  
  // Get username with @ prefix
  const getUsername = () => {
    return user?.username ? `@${user.username}` : '';
  };
  
  // Fetch user data, achievements, and stats
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Get user achievements
      const achievementsResponse = await achievementAPI.getUserAchievements();
      if (achievementsResponse.data) {
        const formattedAchievements = achievementsResponse.data.map(item => ({
          id: item.id.toString(),
          name: item.achievement_details.name,
          description: item.achievement_details.description,
          icon: item.achievement_details.icon,
          category: item.achievement_details.category,
          earned_at: item.earned_at,
          xp_reward: item.achievement_details.xp_reward
        }));
        setAchievements(formattedAchievements);
        
        // Update stats - completed achievements
        const completed = formattedAchievements.filter(a => a.earned_at !== null).length;
        setUserStats(prev => ({
          ...prev,
          totalAchievements: formattedAchievements.length,
          completedAchievements: completed
        }));
      }
      
      // Get courses completed
      const courseProgressResponse = await courseAPI.getUserCourseProgress();
      if (courseProgressResponse.data) {
        const completedCourses = courseProgressResponse.data.filter(
          course => course.is_completed
        ).length;
        
        setUserStats(prev => ({
          ...prev,
          coursesCompleted: completedCourses
        }));
      }
      
      // Get friends count
      try {
        // For now, this is a mock as the API doesn't have friends functionality yet
        // In the future, this should be replaced with a real API call
        // For demo purposes, we'll use the user ID's last digits as a deterministic "random" number
        let friendsCount = 0;
        if (user && user.id) {
          const idStr = user.id.toString();
          const lastDigit = parseInt(idStr.charAt(idStr.length - 1), 10);
          friendsCount = 5 + lastDigit; // 5-14 friends based on last digit of user ID
        } else {
          friendsCount = 8; // Default fallback
        }
        
        setUserStats(prev => ({
          ...prev,
          friendsCount
        }));
      } catch (err) {
        console.log('Error fetching friends:', err);
      }
      
    } catch (error) {
      console.log('Error fetching user data:', error);
      // Fallback to mock data for development
      setAchievements([
        {
          id: '1',
          name: 'First Timer',
          description: 'Complete your first lesson',
          icon: 'school',
          category: 'Learning',
          earned_at: '2023-05-15T10:30:00Z',
          xp_reward: 100
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Complete lessons for 7 consecutive days',
          icon: 'flame',
          category: 'Consistency',
          earned_at: '2023-06-01T14:20:00Z',
          xp_reward: 250
        },
        {
          id: '3',
          name: 'Knowledge Explorer',
          description: 'Complete 3 different courses',
          icon: 'telescope',
          category: 'Exploration',
          earned_at: null,
          progress: 67,
          xp_reward: 300
        },
        {
          id: '4',
          name: 'Quiz Champion',
          description: 'Score 100% on 5 different quizzes',
          icon: 'ribbon',
          category: 'Mastery',
          earned_at: '2023-07-22T09:15:00Z',
          xp_reward: 500
        },
        {
          id: '5',
          name: 'Early Bird',
          description: 'Complete a lesson before 8 AM',
          icon: 'sunny',
          category: 'Habits',
          earned_at: null,
          xp_reward: 150
        },
        {
          id: '6',
          name: 'Night Owl',
          description: 'Complete a lesson after 10 PM',
          icon: 'moon',
          category: 'Habits',
          earned_at: '2023-08-05T22:45:00Z',
          xp_reward: 150
        },
        {
          id: '7',
          name: 'Weekend Warrior',
          description: 'Complete 5 lessons on a weekend',
          icon: 'calendar',
          category: 'Dedication',
          earned_at: null,
          progress: 40,
          xp_reward: 200
        },
        {
          id: '8',
          name: 'Community Helper',
          description: 'Answer 10 questions from other users',
          icon: 'people',
          category: 'Community',
          earned_at: null,
          progress: 20,
          xp_reward: 300
        },
      ]);
      
      // Set default stats in case API fails
      setUserStats({
        totalAchievements: 8,
        completedAchievements: 4,
        coursesCompleted: 3,
        friendsCount: 12
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Image picker function for profile picture
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
  
  // Upload profile picture to backend
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
  
  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'completed') {
      return achievement.earned_at !== null;
    } else if (activeTab === 'in-progress') {
      return achievement.earned_at === null;
    }
    return true; // 'all' tab
  });
  
  // Calculate XP percentage for progress bar
  const calculateXpPercentage = () => {
    if (!profile) return 0;
    
    const xpForNextLevel = profile.level * 100; // Simple calculation
    return Math.min(100, (profile.xp / xpForNextLevel) * 100);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await refreshUser();
    setRefreshing(false);
  };
  
  const handleAchievementPress = (achievement) => {
    navigation.navigate('AchievementDetail', { achievement });
  };
  
  const handleEditProfilePress = () => {
    // Navigate to edit profile screen
    navigation.navigate('ProfileEdit');
  };
  
  // Menu navigation handler
  const handleNavigateToMenu = (screen) => {
    setMenuVisible(false);
    navigation.navigate('MenuScreens', {
      screen: screen
    });
  };

  // Handle debug information
  const handleDebugPress = () => {
    Alert.alert(
      "Debug Info",
      `User: ${JSON.stringify(user, null, 2)}\n\nProfile: ${JSON.stringify(profile, null, 2)}`,
      [{ text: "OK" }]
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
    <SafeAreaView style={[styles.container, { backgroundColor: current.background }]}>
      {/* Header with menu and logout */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={28} color={accent} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: current.text }]}>Profile</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={accent} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Profile Image (non-editable) */}
          <Image
            source={
              profile && profile.avatar 
                ? { uri: profile.avatar } 
                : require('../../assets/images/default-avatar.png')
            }
            style={styles.profileImage}
          />
          
          {/* Profile Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: current.text }]}>{userStats.friendsCount}</Text>
              <Text style={[styles.statLabel, { color: current.textSecondary }]}>Friends</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: current.text }]}>{userStats.completedAchievements}</Text>
              <Text style={[styles.statLabel, { color: current.textSecondary }]}>Achievements</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: current.text }]}>{userStats.coursesCompleted}</Text>
              <Text style={[styles.statLabel, { color: current.textSecondary }]}>Courses</Text>
            </View>
          </View>
        </View>
        
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.username, { color: current.text }]}>{getFullName()}</Text>
          <Text style={[styles.userHandle, { color: current.textSecondary }]}>{getUsername()}</Text>
          <Text style={[styles.bio, { color: current.textSecondary }]}>
            {profile?.bio || 'Learning and growing every day!'}
          </Text>
          
          {/* XP Progress Bar */}
          <View style={styles.xpContainer}>
            <View style={[styles.xpProgressContainer, { backgroundColor: current.border }]}>
              <View 
                style={[
                  styles.xpProgressBar, 
                  { width: `${calculateXpPercentage()}%`, backgroundColor: accent }
                ]} 
              />
            </View>
            <View style={styles.xpLevelInfo}>
              <Text style={[styles.xpLevel, { color: current.text }]}>
                Level {profile?.level || 1}
              </Text>
              <Text style={[styles.xpText, { color: current.textSecondary }]}>
                {profile?.xp || 0} XP / {(profile?.level || 1) * 100} XP
              </Text>
            </View>
          </View>
          
          {/* Edit Profile Button */}
          <TouchableOpacity 
            style={[styles.editButton, { borderColor: current.border }]}
            onPress={handleEditProfilePress}
          >
            <Text style={[styles.editButtonText, { color: current.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          
          {/* Debug button */}
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#666' }]}
            onPress={handleDebugPress}
          >
            <Text style={styles.editButtonText}>Debug</Text>
          </TouchableOpacity>
        </View>
        
        {/* Achievements Tabs */}
        <View style={[styles.tabs, { borderBottomColor: current.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all' && { borderBottomColor: accent, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'all' ? accent : current.textSecondary }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'completed' && { borderBottomColor: accent, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'completed' ? accent : current.textSecondary }
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'in-progress' && { borderBottomColor: accent, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('in-progress')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'in-progress' ? accent : current.textSecondary }
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Achievements Grid */}
        <View style={styles.achievementsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={accentColor} />
            </View>
          ) : filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons 
                name="trophy-outline" 
                size={48} 
                color={current.textSecondary} 
              />
              <Text style={[styles.emptyStateText, { color: current.textSecondary }]}>
                No achievements found in this category
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredAchievements}
              renderItem={({ item }) => (
                <AchievementCard
                  achievement={item}
                  completed={item.earned_at !== null}
                  onPress={() => handleAchievementPress(item)}
                />
              )}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.achievementsGrid}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color={accent} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuList}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigateToMenu('Leaderboards')}
              >
                <Ionicons name="trophy" size={24} color={accent} />
                <Text style={styles.menuItemText}>Leaderboards</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigateToMenu('Friends')}
              >
                <Ionicons name="people" size={24} color={accent} />
                <Text style={styles.menuItemText}>View Friends</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigateToMenu('Communities')}
              >
                <Ionicons name="people-circle" size={24} color={accent} />
                <Text style={styles.menuItemText}>Communities</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigateToMenu('Settings')}
              >
                <Ionicons name="settings" size={24} color={accent} />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    marginBottom: 16,
  },
  xpContainer: {
    marginBottom: 16,
  },
  xpProgressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgressBar: {
    height: '100%',
  },
  xpLevelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLevel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  xpText: {
    fontSize: 12,
  },
  editButton: {
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsContainer: {
    padding: 8,
    minHeight: 200,
  },
  achievementsGrid: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Styles for menu modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
  debugButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginRight: 8,
  },
});

export default ProfileScreen; 