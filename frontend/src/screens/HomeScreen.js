import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import { getMyCourses } from '../services/courseService';

// For fallback icons when course has no specific icon
const defaultCourseIcons = [
  require('../../assets/course-icons/computer.png'),
  require('../../assets/course-icons/design.png'),
  require('../../assets/course-icons/finance.png'),
  require('../../assets/course-icons/marketing.png'),
];

// Import tutorial data
import { tymelyneTutorialData } from '../data/tutorialData';

// Mock friend courses - replace with API call
const friendCourses = [
  { id: '3', title: 'User Interface Fundamentals', icon: require('../../assets/course-icons/design.png') },
  { id: '4', title: 'Responsive Web Design', icon: require('../../assets/course-icons/computer.png') },
  { id: '5', title: 'Mobile App Development', icon: require('../../assets/course-icons/computer.png') },
  { id: '6', title: 'Data Visualization Basics', icon: require('../../assets/course-icons/finance.png') },
];

const HomeScreen = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user's courses
  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const courses = await getMyCourses();
      
      // Debug log to see actual course data
      console.log('Fetched courses from API:', courses);
      
      // Map courses to include icons and format for CourseCard
      const formattedCourses = courses.map((course, index) => {
        // Get the correct title from the course data - handle both title and course_name
        const courseTitle = course.title || course.course_name || 'Untitled Course';
        
        console.log(`Formatting course: ${courseTitle}`);
        
        return {
          id: course._id || course.course_id,
          title: courseTitle,
          // Assign a default icon based on index
          icon: defaultCourseIcons[index % defaultCourseIcons.length],
          // Calculate progress based on completed sections
          progress: calculateProgress(course),
          // Store the original course data for details view
          courseData: {
            ...course,
            // Ensure both title and course_name are set for backward compatibility
            title: courseTitle,
            course_name: courseTitle
          }
        };
      });
      
      setUserCourses(formattedCourses);
    } catch (err) {
      console.error('Failed to fetch user courses:', err);
      setError('Could not load your courses');
    } finally {
      setLoading(false);
    }
  };

  // Refresh courses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Fetch latest course data whenever the screen is focused
      console.log('Home screen focused - refreshing courses');
      fetchUserCourses();
      
      return () => {
        // Cleanup function when screen loses focus (if needed)
      };
    }, []) // Empty dependency array means this only depends on screen focus
  );

  // Calculate course progress percentage
  const calculateProgress = (course) => {
    if (!course.sections || course.sections.length === 0) return 0;
    
    const completedSections = course.sections.filter(section => section.isCompleted).length;
    return Math.round((completedSections / course.sections.length) * 100);
  };

  const handleNavigation = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Render the Active Courses section
  const renderActiveCourses = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="body" style={styles.loadingText}>
            Loading your courses...
          </Typography>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Typography variant="body" style={styles.errorText}>
            {error}
          </Typography>
          <Button
            title="Try Again"
            onPress={() => navigation.navigate('Home')}
            variant="secondary"
            style={styles.tryAgainButton}
          />
        </View>
      );
    }

    if (userCourses.length === 0) {
      return (
        <Typography variant="body" style={styles.emptyCourseText}>
          You don't have any active courses yet.
        </Typography>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {userCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            style={styles.carouselCard}
            onPress={() => handleNavigation('CourseSections', { 
              courseId: course.id,
              courseData: course.courseData
            })}
            onOptionsPress={() => Alert.alert('Options', 'Course options')}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <Screen
      title="Home"
      showHeader={true}
      headerRight={{
        icon: 'menu-outline',
        onPress: handleMenuPress,
      }}
      activeScreen="Home"
      onHomePress={() => {}}
      onAchievementsPress={() => handleNavigation('Leaderboards')}
      onProfilePress={() => handleNavigation('Profile')}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
        <SectionTitle 
          title="Active Courses" 
          rightText="View All" 
          onRightPress={() => handleNavigation('Development')} 
        />
        <View style={styles.coursesContainer}>
          {renderActiveCourses()}
        </View>

        <SectionTitle title="Add a Course" />
        <View style={styles.addCourseContainer}>
          <Card
            variant="elevated"
            style={styles.addCourseCard}
            onPress={() => handleNavigation('Development')}
          >
            <Ionicons name="people-outline" size={32} color={colors.primary} />
            <View style={styles.addCourseTextContainer}>
              <Typography variant="subheading" weight="semiBold">
                Community
              </Typography>
              <Typography variant="body2" color={colors.text.secondary}>
                Find popular courses
              </Typography>
            </View>
          </Card>

          <Card
            variant="elevated"
            style={styles.addCourseCard}
            onPress={() => handleNavigation('Create')}
          >
            <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
            <View style={styles.addCourseTextContainer}>
              <Typography variant="subheading" weight="semiBold">
                Create New
              </Typography>
              <Typography variant="body2" color={colors.text.secondary}>
                Start from scratch
              </Typography>
            </View>
          </Card>
        </View>

        <SectionTitle 
          title="Friends' Courses" 
          rightText="See More" 
          onRightPress={() => handleNavigation('Development')} 
        />
        {friendCourses && friendCourses.length > 0 ? (
          <FlatList
            data={friendCourses}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { courseId: item.id })}
              />
            )}
            contentContainerStyle={styles.gridContainer}
          />
        ) : (
          <Typography variant="body" style={styles.emptyCourseText}>
            No courses from friends to display.
          </Typography>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  welcomeSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  coursesContainer: {
    marginBottom: spacing.l,
  },
  carouselContainer: {
    paddingBottom: spacing.s,
    paddingRight: spacing.l,
  },
  carouselCard: {
    width: 420,
    marginRight: spacing.m,
    height: 100,
  },
  addCourseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  addCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    width: '48%',
  },
  addCourseTextContainer: {
    marginLeft: spacing.s,
    flex: 1,
  },
  gridContainer: {
    paddingBottom: spacing.xl,
  },
  emptyCourseText: {
    textAlign: 'center',
    marginTop: spacing.m,
  },
  loadingContainer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    color: colors.text.secondary,
  },
  errorContainer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.m,
  },
  tryAgainButton: {
    marginTop: spacing.s,
  }
});

export default HomeScreen; 