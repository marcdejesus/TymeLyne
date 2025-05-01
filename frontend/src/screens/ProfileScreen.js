import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { 
  Screen, 
  Card, 
  ProgressBar, 
  SectionTitle,
  theme, 
  Typography
} from '../components';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProgressionData } from '../services/userProgressionService';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [progressData, setProgressData] = useState({
    level: 1,
    totalXp: 0,
    xpToNextLevel: 500,
    levelProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(null);
  const levelTextScale = useRef(new Animated.Value(1)).current;
  
  // Fetch user progression data from backend
  useEffect(() => {
    const fetchUserProgression = async () => {
      try {
        setLoading(true);
        const data = await getUserProgressionData();
        console.log('User progression data:', data);
        
        // Store previous level before updating
        if (previousLevel === null) {
          setPreviousLevel(data.level);
        } else if (data.level > previousLevel) {
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
          ]).start();
          
          setPreviousLevel(data.level);
        }
        
        // Ensure data has required fields
        const processedData = {
          level: data.level || 1,
          totalXp: data.totalXp || 0,
          currentLevelXp: data.currentLevelXp || 0,
          totalXpForNextLevel: data.totalXpForNextLevel || 500,
          levelProgress: data.levelProgress || 0
        };
        
        console.log('Processed progression data:', processedData);
        setProgressData(processedData);
      } catch (error) {
        console.error('Error fetching user progression data:', error);
        // Set fallback data
        setProgressData({
          level: 1,
          totalXp: 0,
          currentLevelXp: 0,
          totalXpForNextLevel: 500,
          levelProgress: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgression();
    
    // Set up interval to refresh data every 30 seconds
    const refreshInterval = setInterval(fetchUserProgression, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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

  // Future backend integration for profile actions:
  //
  // Function to update profile:
  // const updateProfile = async (profileData) => {
  //   try {
  //     const token = await SecureStore.getItemAsync('userToken');
  //     const response = await axios.put('http://yourapi.com/api/users/profile', profileData, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     // Update local user data
  //     setUser(response.data);
  //     await SecureStore.setItemAsync('user', JSON.stringify(response.data));
  //   } catch (error) {
  //     console.error('Error updating profile:', error);
  //   }
  // };
  //
  // Function to get followers:
  // const getFollowers = async () => {
  //   try {
  //     const token = await SecureStore.getItemAsync('userToken');
  //     const response = await axios.get('http://yourapi.com/api/users/followers', {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setFollowers(response.data);
  //   } catch (error) {
  //     console.error('Error fetching followers:', error);
  //   }
  // };

  const handleNavigation = (screenName) => {
    // Update navigation references to work with new navigation structure
    navigation.navigate(screenName);
  };

  const handleMenuPress = () => {
    // Since we removed drawer navigation, show a logout option here
    logout();
  };

  return (
    <Screen
      title="Profile"
      onMenuPress={handleMenuPress}
      onRightPress={() => handleNavigation('Settings')}
      rightIcon="settings"
      // Remove bottom navigation props since they're now handled by Tab.Navigator
      showBottomNav={false}
      backgroundColor={theme.colors.background.main}
    >
      {/* Profile Information */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={require('../../assets/default-avatar.png')} // Placeholder for profile picture
            style={styles.profileImage} 
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
              {progressData && progressData.totalXpForNextLevel 
                ? `${progressData.currentLevelXp || 0}/${progressData.totalXpForNextLevel} XP`
                : '0/500 XP'}
            </Typography>
          </View>
        </View>
      </View>
      
      {/* Top Courses Section */}
      <SectionTitle title="Top Courses" />
      <View style={styles.coursesGrid}>
        {topCourses && topCourses.length > 0 ? (
          topCourses.map(course => (
            <Card 
              key={course.id} 
              style={styles.courseCard}
              onPress={() => handleNavigation('CourseDetails')}
            >
              <Image source={course.icon} style={styles.courseIcon} />
              <Text style={styles.courseTitle}>{course.title}</Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No courses yet</Text>
          </Card>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    padding: width * 0.04,
    alignItems: 'center',
    marginTop: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: '#D8D0BA',
    marginRight: 16,
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
    marginTop: 5,
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  stat: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'right',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  courseCard: {
    width: '46%',
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
  },
  courseIcon: {
    width: width * 0.1,
    height: width * 0.1,
    maxWidth: 40,
    maxHeight: 40,
    borderRadius: width * 0.05,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: theme.typography.fontSize.regular,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  emptyStateCard: {
    width: '100%',
    height: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.secondary,
  },
});

export default ProfileScreen; 