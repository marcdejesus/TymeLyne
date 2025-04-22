import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  // Mock data for demonstration
  // In production, this would come from an API call like:
  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     try {
  //       const token = await SecureStore.getItemAsync('userToken');
  //       const response = await axios.get('http://yourapi.com/api/courses/active', {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  //       setActiveCourses(response.data);
  //     } catch (error) {
  //       console.error('Error fetching active courses:', error);
  //     }
  //   };
  //   fetchCourses();
  // }, []);

  const activeCourses = [
    { 
      id: 1, 
      title: 'Digital Marketing', 
      icon: require('../../assets/course-icons/marketing.png'),
      progress: 10 
    }
  ];

  // Mock data for friends' courses
  // In production, this would be fetched from the backend:
  // GET /api/courses/friends
  const friendsCourses = [
    { 
      id: 1, 
      title: 'Investing', 
      icon: require('../../assets/course-icons/finance.png'),
      username: '@herobrine' 
    },
    { 
      id: 2, 
      title: 'JavaScript', 
      icon: require('../../assets/course-icons/computer.png'),
      username: '@steve' 
    }
  ];

  const handleNavigation = (screenName, params) => {
    // For unimplemented screens, navigate to development page
    if (screenName === 'Profile') {
      navigation.navigate('Profile');
    } else if (screenName === 'Home') {
      // Already on home
    } else if (screenName === 'Create') {
      navigation.navigate('Create');
    } else if (screenName === 'CourseDetails') {
      navigation.navigate('CourseDetails', params);
    } else {
      navigation.navigate('Development');
    }
  };

  const handleMenuPress = () => {
    // Since we removed drawer navigation, show a logout option here
    logout();
  };

  // Future backend integration for course actions:
  // 
  // Function to handle starting a course:
  // const startCourse = async (courseId) => {
  //   try {
  //     const token = await SecureStore.getItemAsync('userToken');
  //     await axios.post(`http://yourapi.com/api/courses/${courseId}/start`, {}, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     // Refresh courses after starting
  //     fetchCourses();
  //   } catch (error) {
  //     console.error('Error starting course:', error);
  //   }
  // };
  //
  // Function to update course progress:
  // const updateProgress = async (courseId, progress) => {
  //   try {
  //     const token = await SecureStore.getItemAsync('userToken');
  //     await axios.put(`http://yourapi.com/api/courses/${courseId}/progress`, { progress }, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //   } catch (error) {
  //     console.error('Error updating progress:', error);
  //   }
  // };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F1E0" />
      <View style={styles.container}>
        {/* Header with Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMenuPress}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity onPress={() => handleNavigation('Notifications')}>
            <Text style={styles.notificationIcon}>⟩</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Active Courses Section */}
          <Text style={styles.sectionTitle}>Active Courses</Text>
          
          {activeCourses.map(course => (
            <TouchableOpacity 
              key={course.id} 
              style={styles.courseCard}
              onPress={() => handleNavigation('CourseDetails', { courseId: course.id })}
            >
              <View style={styles.courseIconContainer}>
                <Image source={course.icon} style={styles.courseIcon} />
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{course.progress}% COMPLETE</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${course.progress}%` }]} />
                  </View>
                </View>
                <View style={styles.courseOptions}>
                  <Text style={styles.optionDots}>•••</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Add a Course Section */}
          <Text style={styles.sectionTitle}>Add a Course</Text>
          <View style={styles.addCourseContainer}>
            <TouchableOpacity 
              style={styles.addCourseOption}
              onPress={() => handleNavigation('Community')}
            >
              <Text style={styles.downloadIcon}>↓</Text>
              <Text style={styles.addOptionText}>Community</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addCourseOption}
              onPress={() => handleNavigation('Create')}
            >
              <Text style={styles.createIcon}>+</Text>
              <Text style={styles.addOptionText}>Create</Text>
            </TouchableOpacity>
          </View>
          
          {/* Friend's Courses Section */}
          <Text style={styles.sectionTitle}>Friend's Courses</Text>
          <View style={styles.friendsCoursesContainer}>
            {friendsCourses.map(course => (
              <TouchableOpacity 
                key={course.id} 
                style={styles.friendCourseCard}
                onPress={() => handleNavigation('CourseDetails', { courseId: course.id, fromFriend: true })}
              >
                <Image source={course.icon} style={styles.friendCourseIcon} />
                <Text style={styles.friendCourseTitle}>{course.title}</Text>
                <Text style={styles.friendUsername}>{course.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <SafeAreaView style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={[styles.navItem, styles.activeNavItem]} 
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
              style={styles.navItem}
              onPress={() => handleNavigation('Profile')}
            >
              <Text style={styles.navIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
  },
  menuIcon: {
    fontSize: 24,
    color: '#4A4A3A',
    padding: 4, // Add more touch area
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  notificationIcon: {
    fontSize: 24,
    color: '#4A4A3A',
    padding: 4, // Add more touch area
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24, // Extra padding at the bottom for better scrolling
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 12,
    marginTop: 8,
  },
  courseCard: {
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseIconContainer: {
    marginRight: 16,
  },
  courseIcon: {
    width: 50,
    height: 50,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
    width: '85%', // Avoid overlap with options dots
  },
  progressText: {
    fontSize: 12,
    color: '#6B6B5A',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0D8C0',
    borderRadius: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#D35C34',
    borderRadius: 4,
  },
  courseOptions: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  optionDots: {
    fontSize: 24,
    color: '#6B6B5A',
    textAlign: 'center',
    padding: 4, // Add more touch area
  },
  addCourseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addCourseOption: {
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.25, // Responsive height based on screen width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  downloadIcon: {
    fontSize: 32,
    color: '#6B6B5A',
    marginBottom: 8,
  },
  createIcon: {
    fontSize: 32,
    color: '#6B6B5A',
    marginBottom: 8,
  },
  addOptionText: {
    fontSize: 16,
    color: '#4A4A3A',
  },
  friendsCoursesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  friendCourseCard: {
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friendCourseIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  friendCourseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A3A',
    textAlign: 'center',
  },
  friendUsername: {
    fontSize: 12,
    color: '#6B6B5A',
    marginTop: 4,
  },
  bottomNavContainer: {
    backgroundColor: '#F9F1E0',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
  },
  bottomNav: {
    flexDirection: 'row',
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

export default HomeScreen; 