import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * Profile Screen - Shows user profile, stats, and achievements
 */
const ProfileScreen = ({ navigation, route }) => {
  const { user, logout } = useAuth();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const isOwnProfile = !route.params; // If no params, it's the user's own profile
  
  // Demo user data
  const userData = {
    name: user?.name || 'Full Name',
    username: user?.username || 'username',
    tag: 'OG',
    stats: {
      coursesCompleted: 2,
      globalLeaderboard: 2,
      friendsList: 2,
    },
    xp: {
      current: 750,
      total: 1000,
    },
    achievements: [
      { id: '1', title: 'First Course', icon: 'school' },
      { id: '2', title: 'Early Adopter', icon: 'star' },
      { id: '3', title: 'Streak Master', icon: 'flame' },
    ],
  };
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            const success = await logout();
            if (!success) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    console.log('Edit profile');
    // Navigate to edit profile screen
  };
  
  // Handle add friend
  const handleAddFriend = () => {
    console.log('Add friend');
    // Implement add friend functionality
  };
  
  // Go back
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Avatar and User Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
          </View>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userHandle}>@{userData.username}</Text>
            <Text style={styles.userTag}>{userData.tag}</Text>
          </View>
          
          {/* Edit Profile or Add Friend Button */}
          {isOwnProfile ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={24} color={accentColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleAddFriend}>
              <Ionicons name="add" size={24} color={accentColor} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.stats.coursesCompleted}</Text>
            <Text style={styles.statLabel}>Courses Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.stats.globalLeaderboard}</Text>
            <Text style={styles.statLabel}>Global Leaderboard</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.stats.friendsList}</Text>
            <Text style={styles.statLabel}>Friends List</Text>
          </View>
        </View>
        
        {/* XP Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBarBackground}>
            <View 
              style={[
                styles.xpBarFill, 
                { width: `${(userData.xp.current / userData.xp.total) * 100}%`, backgroundColor: accentColor }
              ]} 
            />
          </View>
          <Text style={styles.xpText}>
            {userData.xp.current}/{userData.xp.total} XP
          </Text>
        </View>
        
        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>Achievement Showcase</Text>
          <View style={styles.achievementsGrid}>
            {userData.achievements.map(achievement => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Ionicons name={achievement.icon} size={30} color={accentColor} />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Logout Button (only on own profile) */}
        {isOwnProfile && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
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
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDDDDD',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userHandle: {
    color: '#999',
    fontSize: 16,
  },
  userTag: {
    color: DEFAULT_ACCENT_COLOR,
    marginTop: 5,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  xpContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  xpBarBackground: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: DEFAULT_ACCENT_COLOR,
    borderRadius: 5,
  },
  xpText: {
    color: '#E67E22',
    fontSize: 14,
    textAlign: 'right',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  achievementsGrid: {
    flexDirection: 'row',
    backgroundColor: '#E67E22',
    borderRadius: 10,
    padding: 15,
  },
  achievementItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#794B16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 