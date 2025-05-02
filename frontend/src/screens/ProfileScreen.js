import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions,
  Platform,
  Animated,
  RefreshControl
} from 'react-native';
import { 
  Screen, 
  Card, 
  ProgressBar, 
  SectionTitle,
  Typography
} from '../components';
import XpChart from '../components/XpChart';
import ActivityFeed from '../components/ActivityFeed';
import { AuthContext } from '../contexts/AuthContext';
import { useUserProgression } from '../contexts/UserProgressionContext';
import { colors } from '../constants/theme';
import { getActivityFeed } from '../services/activityService';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { 
    progressData, 
    loading: progressLoading, 
    error: progressError,
    isLevelUp,
    resetLevelUp,
    fetchUserProgression
  } = useUserProgression();
  
  const levelTextScale = useRef(new Animated.Value(1)).current;
  
  // Activity feed state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch activity feed
  const fetchActivities = useCallback(async () => {
    try {
      setActivityLoading(true);
      const data = await getActivityFeed({ limit: 10 });
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivityLoading(false);
    }
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserProgression(),
      fetchActivities()
    ]);
    setRefreshing(false);
  }, [fetchUserProgression, fetchActivities]);
  
  // Handle level up animation
  useEffect(() => {
    if (isLevelUp) {
      // Level up animation
      Animated.sequence([
        Animated.timing(levelTextScale, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(levelTextScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Reset the level up flag after animation
        resetLevelUp();
      });
    }
  }, [isLevelUp, levelTextScale, resetLevelUp]);
  
  // Use real data from user and progressData
  const followers = user?.follower_count || 0;
  const friends = user?.friends_count || 0;
  const username = user?.username || '@username';
  
  // Mock courses data
  const topCourses = [
    { id: 1, title: 'Investing', icon: require('../../assets/course-icons/finance.png') },
    { id: 2, title: 'JavaScript', icon: require('../../assets/course-icons/computer.png') },
    { id: 3, title: 'Finance', icon: require('../../assets/course-icons/finance.png') },
    { id: 4, title: 'Python', icon: require('../../assets/course-icons/computer.png') },
  ];

  const handleNavigation = (screenName) => {
    // Update navigation references to work with new navigation structure
    navigation.navigate(screenName);
  };

  const handleSettingsPress = () => {
    // Navigate to settings screen
    navigation.navigate('Settings');
  };

  return (
    <Screen
      title="Tymelyne"
      onRightPress={logout}
      rightIcon="log-out-outline"
      onMenuPress={handleSettingsPress}
      menuIcon="cog-outline"
      showBottomNav={false}
      backgroundColor={colors.background}
      scrollable={true} // Enable scrolling for the entire screen
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Profile Information */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={require('../../assets/default-avatar.png')} // Placeholder for profile picture
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <Animated.Text 
            style={[
              styles.levelText, 
              { transform: [{ scale: levelTextScale }] }
            ]}
          >
            LEVEL {progressData.level}
          </Animated.Text>
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{username}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Followers</Text>
                <Text style={styles.statValue}>{followers}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Friends</Text>
                <Text style={styles.statValue}>{friends}</Text>
              </View>
            </View>
          </View>
          
          {/* Level Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progressData.levelProgress || 0} 
              showLabel={false} 
            />
            <Typography 
              variant="caption" 
              style={styles.progressText}
            >
              {progressData && (progressData.totalXpForNextLevel || progressData.xpToNextLevel)
                ? `${progressData.currentLevelXp || 0}/${progressData.totalXpForNextLevel || progressData.xpToNextLevel} XP`
                : '0/500 XP'}
            </Typography>
          </View>
        </View>
      </View>
      
      {/* XP Chart Section */}
      <XpChart />
      
      
      {/* Activity Feed Section - Disable its internal scroll by passing useParentScroll prop */}
      <ActivityFeed activities={activities} loading={activityLoading} useParentScroll={true} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    padding: width * 0.04,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: '#D8D0BA',
    overflow: 'hidden',
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
  levelText: {
    marginTop: 20,
    fontSize: 12,
    color: colors.text.secondary,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  userInfoContainer: {
    paddingTop: 10,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  stat: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressContainer: {
    marginTop: 20,
    width: '100%',
  },
  progressText: {
    textAlign: 'right',
    marginTop: 4,
    color: colors.text.secondary,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  courseCard: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
  },
  courseIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
  emptyStateCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default ProfileScreen; 