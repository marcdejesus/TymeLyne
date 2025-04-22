import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';

// Get device dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isIphoneX = Platform.OS === 'ios' && 
                 (height > 800 || width > 800);

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  
  // Mock data for demonstration
  // In production, this data would come from the user object fetched from the backend
  // Example API endpoint: GET /api/users/profile
  const level = 10;
  const followers = 1;
  const friends = 1;
  const username = user?.username || '@username';
  
  // Mock courses data
  // In production, this would be fetched with:
  // GET /api/users/courses/top
  // This would return the user's most active or highest-rated courses
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
    // For unimplemented screens, navigate to development page
    if (screenName === 'Home') {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Development');
    }
  };

  const handleMenuPress = () => {
    // Since we removed drawer navigation, show a logout option here
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F1E0" />
      <View style={styles.container}>
        {/* Header with Navigation */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.touchableIcon}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.touchableIcon}
            onPress={() => handleNavigation('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⟩</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Profile Information */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require('../../assets/favicon.png')} // Placeholder for profile picture
                style={styles.profileImage} 
              />
              <Text style={styles.levelText}>LEVEL {level}</Text>
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
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '30%' }]} />
                </View>
              </View>
            </View>
          </View>
          
          {/* Top Courses Section */}
          <Text style={styles.sectionTitle}>Top Courses</Text>
          <View style={styles.coursesGrid}>
            {topCourses.map(course => (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard}
                onPress={() => handleNavigation('CourseDetails')}
                activeOpacity={0.8}
              >
                <Image source={course.icon} style={styles.courseIcon} />
                <Text style={styles.courseTitle}>{course.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => handleNavigation('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleNavigation('Achievements')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.activeNavItem]}
            onPress={() => handleNavigation('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0', // Beige background
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
  },
  touchableIcon: {
    padding: 8, // Increased touch target
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: Math.min(24, width * 0.06), // Responsive font size
    color: '#4A4A3A',
  },
  headerTitle: {
    fontSize: Math.min(18, width * 0.05),
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  settingsIcon: {
    fontSize: Math.min(24, width * 0.06),
    color: '#4A4A3A',
  },
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
    fontSize: Math.min(12, width * 0.03),
    color: '#6B6B5A',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  stat: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: Math.min(12, width * 0.03),
    color: '#6B6B5A',
  },
  statValue: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0D8C0',
    borderRadius: 5,
    overflow: 'hidden', // Ensures progress stays within the bar
  },
  progress: {
    height: '100%',
    backgroundColor: '#D35C34', // Orange
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#4A4A3A',
    padding: width * 0.04,
    paddingBottom: 8,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: width * 0.02,
  },
  courseCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    backgroundColor: '#F4ECE1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.3,
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
  courseIcon: {
    width: width * 0.1,
    height: width * 0.1,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: Math.min(16, width * 0.04),
    textAlign: 'center',
    color: '#4A4A3A',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
    paddingBottom: isIphoneX ? 20 : 0, // Add padding for iPhone X and newer models
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#D35C34',
  },
  navIcon: {
    fontSize: Math.min(24, width * 0.06),
  },
});

export default ProfileScreen; 