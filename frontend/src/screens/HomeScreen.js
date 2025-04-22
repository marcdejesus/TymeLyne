import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Screen, 
  CourseCard, 
  Card, 
  SectionTitle, 
  ProgressBar, 
  theme 
} from '../components';

const { width } = Dimensions.get('window');

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
    <Screen
      title="Home"
      onMenuPress={handleMenuPress}
      onRightPress={() => handleNavigation('Notifications')}
      rightIcon="notifications-outline"
      activeScreen="Home"
      onHomePress={() => handleNavigation('Home')}
      onAchievementsPress={() => handleNavigation('Achievements')}
      onProfilePress={() => handleNavigation('Profile')}
      backgroundColor={theme.colors.background.main}
    >
      {/* Active Courses Section */}
      <SectionTitle title="Active Courses" />
      
      {activeCourses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course}
          onPress={() => handleNavigation('CourseDetails', { courseId: course.id })}
          onOptionsPress={() => handleNavigation('CourseOptions', { courseId: course.id })}
        />
      ))}
      
      {/* Add a Course Section */}
      <SectionTitle title="Add a Course" />
      <View style={styles.addCourseContainer}>
        <Card
          style={styles.addCourseOption}
          onPress={() => handleNavigation('Community')}
        >
          <Text style={styles.downloadIcon}>↓</Text>
          <Text style={styles.addOptionText}>Community</Text>
        </Card>
        <Card
          style={styles.addCourseOption}
          onPress={() => handleNavigation('Create')}
        >
          <Text style={styles.createIcon}>+</Text>
          <Text style={styles.addOptionText}>Create</Text>
        </Card>
      </View>
      
      {/* Friend's Courses Section */}
      <SectionTitle title="Friend's Courses" />
      <View style={styles.friendsCoursesContainer}>
        {friendsCourses.map(course => (
          <Card
            key={course.id}
            style={styles.friendCourseCard}
            onPress={() => handleNavigation('CourseDetails', { courseId: course.id, fromFriend: true })}
          >
            <Image source={course.icon} style={styles.friendCourseIcon} />
            <Text style={styles.friendCourseTitle}>{course.title}</Text>
            <Text style={styles.friendUsername}>{course.username}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  addCourseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addCourseOption: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.25, // Responsive height based on screen width
    marginHorizontal: 0,
    padding: 0,
  },
  downloadIcon: {
    fontSize: 32,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  createIcon: {
    fontSize: 32,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  addOptionText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
  },
  friendsCoursesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: -theme.spacing.s, // Counteract the Card component's marginVertical
  },
  friendCourseCard: {
    width: '48%',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  friendCourseIcon: {
    width: width * 0.1,
    height: width * 0.1,
    marginBottom: 8,
  },
  friendCourseTitle: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  friendUsername: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
});

export default HomeScreen; 