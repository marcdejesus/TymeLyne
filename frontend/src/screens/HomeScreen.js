import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView, Animated, RefreshControl, Platform } from 'react-native';
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
// Import Constants to check if running in dev mode
import Constants from 'expo-constants';

// For fallback icons when course has no specific icon
const defaultCourseIcons = [
  require('../../assets/course-icons/computer.png'),
  require('../../assets/course-icons/design.png'),
  require('../../assets/course-icons/finance.png'),
  require('../../assets/course-icons/marketing.png'),
];

// Import tutorial data
import { tymelyneTutorialData } from '../data/tutorialData';

// Updated to show completed courses instead of friend courses
const HomeScreen = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [userCourses, setUserCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Separate visual loading state to show skeletons
  const [visibleLoading, setVisibleLoading] = useState(true);
  // Add state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  // Track if initial data has been loaded
  const initialLoadComplete = useRef(false);

  // Determine if in development mode
  const isDevMode = __DEV__;

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
      
      // Filter out completed courses (all sections completed)
      const completed = courses.filter(course => {
        if (!course.sections || course.sections.length === 0) return false;
        return course.sections.every(section => section.isCompleted);
      });
      
      console.log('Completed courses count:', completed.length);
      
      // Format completed courses for display
      const formattedCompletedCourses = completed.map((course, index) => {
        const courseTitle = course.title || course.course_name || 'Untitled Course';
        // Abbreviate title for grid display
        let displayTitle = courseTitle;
        if (displayTitle.length > 12) {
          displayTitle = displayTitle.substring(0, 10) + '...';
        }
        
        return {
          id: course._id || course.course_id,
          title: displayTitle,
          // Assign a default icon based on index
          icon: defaultCourseIcons[index % defaultCourseIcons.length],
          progress: 100, // 100% completed
          courseData: { ...course, title: courseTitle, course_name: courseTitle }
        };
      });
      
      // Sort by most recently active or created
      setCompletedCourses(formattedCompletedCourses);
      
      // Get all user's courses - we consider a course active if it's not fully complete
      // This means a course with no sections is active, or if at least one section is not completed
      const activeCourses = courses.filter(course => {
        // If there are no sections, it's still considered active
        if (!course.sections || course.sections.length === 0) return true;
        
        // A course is active if at least one section is not completed
        return !course.sections.every(section => section.isCompleted);
      });
      
      console.log('Active courses count:', activeCourses.length);
      console.log('Active courses data:', JSON.stringify(activeCourses, null, 2));
      
      // Map active courses to include icons and format for CourseCard
      const formattedCourses = activeCourses.map((course, index) => {
        // Get the correct title from the course data - handle both title and course_name
        const courseTitle = course.title || course.course_name || 'Untitled Course';
        
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
      
      console.log('Formatted active courses:', formattedCourses.length);
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
    // Reset the initialLoadComplete flag to force a complete refresh
    initialLoadComplete.current = false;
    fetchUserCourses(false); // Don't show skeleton loaders on refresh
  }, []);

  // Add a function to manually refresh data
  const handleManualRefresh = () => {
    // Reset the initialLoadComplete flag to force a complete refresh
    initialLoadComplete.current = false;
    // Show full loading UI for manual refresh
    fetchUserCourses(true);
  };

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

  // Combined header actions for both menu and debug refresh
  const handleRightHeaderPress = () => {
    // In dev mode, long press will refresh data
    if (isDevMode) {
      Alert.alert(
        'Dev Menu',
        'Choose an action',
        [
          {
            text: 'Logout',
            onPress: () => {
              logout();
            },
          },
          {
            text: 'Force Refresh',
            onPress: () => {
              initialLoadComplete.current = false;
              fetchUserCourses(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } else {
      // In production, just show logout menu
      handleMenuPress();
    }
  };

  // Render a section title or skeleton
  const renderSectionTitle = (title, rightText, onRightPress, style) => {
    if (visibleLoading) {
      return <SkeletonLoader variant="section-title" />;
    }
    
    return (
      <SectionTitle 
        title={title} 
        rightText={rightText} 
        onRightPress={onRightPress} 
        style={style}
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
            onPress={handleManualRefresh}
            variant="secondary"
            style={styles.tryAgainButton}
          />
        </View>
      );
    }

    if (userCourses.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Typography variant="body" style={styles.emptyCourseText}>
            You don't have any active courses yet.
          </Typography>
          <Button
            title="Refresh"
            onPress={handleManualRefresh}
            variant="secondary"
            size="small"
            style={styles.refreshButton}
          />
        </View>
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
  
  // Render Completed Courses - replacing the Friends Courses section
  const renderCompletedCourses = () => {
    if (visibleLoading) {
      return <SkeletonLoader variant="grid" count={4} />;
    }
    
    // Get up to 4 completed courses
    const availableCourses = completedCourses.slice(0, 4);
    
    if (availableCourses.length === 0) {
      return (
        <Typography variant="body" style={styles.emptyCourseText}>
          Complete a course to see it here!
        </Typography>
      );
    }

    // Create a 2x2 grid layout manually instead of using FlatList with flexWrap
    return (
      <View style={styles.completedCoursesContainer}>
        <View style={styles.completedCoursesRow}>
          {/* Top Row */}
          <View style={styles.completedCourseSlot}>
            {availableCourses.length > 0 ? (
              <CourseCard
                course={availableCourses[0]}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { 
                  courseId: availableCourses[0].id,
                  courseData: availableCourses[0].courseData
                })}
              />
            ) : <View style={styles.emptyCourseSlot} />}
          </View>
          
          <View style={styles.completedCourseSlot}>
            {availableCourses.length > 1 ? (
              <CourseCard
                course={availableCourses[1]}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { 
                  courseId: availableCourses[1].id,
                  courseData: availableCourses[1].courseData
                })}
              />
            ) : <View style={styles.emptyCourseSlot} />}
          </View>
        </View>
        
        <View style={styles.completedCoursesRow}>
          {/* Bottom Row */}
          <View style={styles.completedCourseSlot}>
            {availableCourses.length > 2 ? (
              <CourseCard
                course={availableCourses[2]}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { 
                  courseId: availableCourses[2].id,
                  courseData: availableCourses[2].courseData
                })}
              />
            ) : <View style={styles.emptyCourseSlot} />}
          </View>
          
          <View style={styles.completedCourseSlot}>
            {availableCourses.length > 3 ? (
              <CourseCard
                course={availableCourses[3]}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { 
                  courseId: availableCourses[3].id,
                  courseData: availableCourses[3].courseData
                })}
              />
            ) : <View style={styles.emptyCourseSlot} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen
      title="Home"
      showHeader={true}
      headerRight={{
        icon: isDevMode ? 'construct-outline' : 'menu-outline',
        onPress: handleRightHeaderPress,
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
        <View style={styles.firstSectionTitleContainer}>
          {renderSectionTitle("Active Courses", "View All", () => handleNavigation('Development'))}
        </View>
        <View style={styles.coursesContainer}>
          {renderActiveCourses()}
        </View>

        {/* Add a Course Section */}
        {renderSectionTitle("Add a Course", null, null, styles.addCourseSectionTitle)}
        {renderAddCourseCards()}

        {/* Completed Courses Section - replacing Friends' Courses */}
        {renderSectionTitle("Completed Courses", "See More", () => handleNavigation('Development'), styles.friendsSectionTitle)}
        {renderCompletedCourses()}
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
    paddingTop: spacing.s,
    paddingBottom: spacing.xl * 2, // Add extra padding at the bottom
  },
  welcomeSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  firstSectionTitleContainer: {
    marginTop: 0, // No extra margin for the first section title
  },
  coursesContainer: {
    marginBottom: spacing.xs, // Further reduced from spacing.m to spacing.xs
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
    marginBottom: spacing.m, // Reduced from spacing.xl
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
    paddingBottom: spacing.m,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  addCourseSectionTitle: {
    marginTop: -spacing.xs, // Increased negative top margin to reduce more space
  },
  friendsSectionTitle: {
    marginTop: spacing.m,
  },
  completedCoursesContainer: {
    width: '100%',
    padding: spacing.xs,
  },
  completedCoursesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  completedCourseSlot: {
    width: '48%',
  },
  emptyCourseSlot: {
    opacity: 0, // Make empty slots invisible
  },
  emptyStateContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  refreshButton: {
    marginTop: spacing.m,
    minWidth: 120,
  },
});

export default HomeScreen; 