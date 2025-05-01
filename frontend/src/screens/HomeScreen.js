import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import CourseCard from '../components/CourseCard';
import SkeletonLoader from '../components/SkeletonLoader';
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
  // Separate visual loading state to show skeletons
  const [visibleLoading, setVisibleLoading] = useState(true);
  // Add state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  // Track if initial data has been loaded
  const initialLoadComplete = useRef(false);

  // Function to fetch user's courses
  const fetchUserCourses = async (showLoadingUI = true) => {
    try {
      if (showLoadingUI) {
        setLoading(true);
        setVisibleLoading(true);
      }
      
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
      initialLoadComplete.current = true;
      
      // Slightly delay hiding the loading state to ensure smooth transition
      setTimeout(() => {
        setVisibleLoading(false);
        setLoading(false);
        if (refreshing) setRefreshing(false);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch user courses:', err);
      setError('Could not load your courses');
      setLoading(false);
      setVisibleLoading(false);
      if (refreshing) setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserCourses(false); // Don't show skeleton loaders on refresh
  }, []);

  // Refresh courses when screen comes into focus, but only on first mount
  useFocusEffect(
    useCallback(() => {
      // Only load data if it hasn't been loaded before
      if (!initialLoadComplete.current) {
        console.log('Home screen focused - initial data load');
        fetchUserCourses();
      } else {
        console.log('Home screen focused - using cached data');
        // If we already have data, just use what we have
        setLoading(false);
        setVisibleLoading(false);
      }
      
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

  // Function to handle navigation
  const handleNavigation = (screen, params = {}) => {
    // If trying to navigate to a tab screen, use the tab name
    if (screen === 'Home') {
      navigation.navigate('HomeTab', params);
    } else if (screen === 'Leaderboards') {
      navigation.navigate('LeaderboardsTab', params);
    } else if (screen === 'Profile') {
      navigation.navigate('ProfileTab', params);
    } else {
      // Otherwise use the original screen name
      navigation.navigate(screen, params);
    }
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

  // Render a section title or skeleton
  const renderSectionTitle = (title, rightText, onRightPress) => {
    if (visibleLoading) {
      return <SkeletonLoader variant="section-title" />;
    }
    
    return (
      <SectionTitle 
        title={title} 
        rightText={rightText} 
        onRightPress={onRightPress} 
      />
    );
  };

  // Render the Active Courses section
  const renderActiveCourses = () => {
    if (visibleLoading) {
      return <SkeletonLoader variant="course" count={2} />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Typography variant="body" style={styles.errorText}>
            {error}
          </Typography>
          <Button
            title="Try Again"
            onPress={() => navigation.navigate('HomeTab')}
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
  
  // Render Add Course Cards
  const renderAddCourseCards = () => {
    if (visibleLoading) {
      // Return skeleton that matches the height of the add course cards
      return (
        <View style={styles.addCourseContainer}>
          <View style={styles.addCourseSkeleton}>
            <SkeletonLoader width="100%" height={60} />
          </View>
          <View style={styles.addCourseSkeleton}>
            <SkeletonLoader width="100%" height={60} />
          </View>
        </View>
      );
    }
    
    return (
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
    );
  };
  
  // Render Friend Courses
  const renderFriendCourses = () => {
    if (visibleLoading) {
      return <SkeletonLoader variant="grid" count={4} />;
    }
    
    if (friendCourses && friendCourses.length > 0) {
      return (
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
      );
    }
    
    return (
      <Typography variant="body" style={styles.emptyCourseText}>
        No courses from friends to display.
      </Typography>
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
      showBottomNav={false}
    >
      {/* Use a fixed height container for the entire content to prevent layout shifts */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Active Courses Section */}
        {renderSectionTitle("Active Courses", "View All", () => handleNavigation('Development'))}
        <View style={styles.coursesContainer}>
          {renderActiveCourses()}
        </View>

        {/* Add a Course Section */}
        {renderSectionTitle("Add a Course", null, null)}
        {renderAddCourseCards()}

        {/* Friends' Courses Section */}
        {renderSectionTitle("Friends' Courses", "See More", () => handleNavigation('Development'))}
        {renderFriendCourses()}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  contentContainer: {
    paddingBottom: spacing.xl * 2, // Add extra padding at the bottom
  },
  welcomeSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  coursesContainer: {
    marginBottom: spacing.l,
    minHeight: 120, // Fixed height to prevent layout shifts
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
    minHeight: 100, // Fixed height to prevent layout shifts
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
  },
  addCourseSkeleton: {
    width: '48%',
    borderRadius: 10,
    padding: spacing.m,
    justifyContent: 'center',
  },
});

export default HomeScreen; 