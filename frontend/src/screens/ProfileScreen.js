import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

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
    <View style={styles.container}>
      {/* Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenuPress}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => handleNavigation('Settings')}>
          <Text style={styles.settingsIcon}>⟩</Text>
        </TouchableOpacity>
      </View>
      
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
      <ScrollView>
        <View style={styles.coursesGrid}>
          {topCourses.map(course => (
            <TouchableOpacity 
              key={course.id} 
              style={styles.courseCard}
              onPress={() => handleNavigation('CourseDetails')}
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
        >
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Achievements')}
        >
          <Text style={styles.navIcon}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => handleNavigation('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0', // Beige background from the screenshots
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
  },
  menuIcon: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  settingsIcon: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  profileSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D8D0BA', // Placeholder color
    marginRight: 16,
  },
  levelText: {
    marginTop: 5,
    fontSize: 12,
    color: '#6B6B5A',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
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
    fontSize: 12,
    color: '#6B6B5A',
  },
  statValue: {
    fontSize: 14,
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
  },
  progress: {
    height: '100%',
    backgroundColor: '#D35C34', // Orange from the screenshots
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
    padding: 16,
    paddingBottom: 8,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  courseCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  courseIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A4A3A',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
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
    fontSize: 24,
  },
});

export default ProfileScreen; 