import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import Screen from '../components/Screen';
import CourseCard from '../components/CourseCard';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  // Mock data for demonstration
  // In production, this would come from an API call

  const activeCourses = [
    { 
      id: 1, 
      title: 'Digital Marketing', 
      icon: require('../../assets/course-icons/marketing.png'),
      progress: 10 
    }
  ];

  // Mock data for friends' courses
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
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => logout(),
          style: "destructive"
        }
      ]
    );
  };

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
      backgroundColor={colors.background}
      scrollable={true}
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
          <Ionicons name="download-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.addOptionText}>Community</Text>
        </Card>
        <Card
          style={styles.addCourseOption}
          onPress={() => handleNavigation('Create')}
        >
          <Ionicons name="add" size={28} color={colors.textSecondary} />
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
    marginBottom: 20,
  },
  addCourseOption: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.25,
    padding: 0,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addOptionText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 10,
  },
  friendsCoursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  friendCourseCard: {
    width: '48%',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendCourseIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  friendCourseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen; 