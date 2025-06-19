import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import CourseCard from '../components/CourseCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { AuthContext } from '../contexts/AuthContext';
import { colors, spacing, borderRadius } from '../constants/theme';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import { getMyCourses, removeFromCurrentCourses } from '../services/courseService';

// For fallback icons when course has no specific icon
const defaultCourseIcons = [
  require('../../assets/course-icons/computer.png'),
  require('../../assets/course-icons/design.png'),
  require('../../assets/course-icons/finance.png'),
  require('../../assets/course-icons/marketing.png'),
];

// Helper function to get course icon
const getCourseIcon = (course, index) => {
  // Prioritize AI-generated logo
  if (course.ai_logo) {
    return { uri: course.ai_logo };
  }
  // Fallback to default icons
  return defaultCourseIcons[index % defaultCourseIcons.length];
};

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

  // Debug refreshing state changes
  useEffect(() => {
    console.log('🔄 HomeScreen: Refreshing state changed to:', refreshing);
  }, [refreshing]);

  // Debug loading state changes
  useEffect(() => {
    console.log('⏳ HomeScreen: Loading state changed to:', loading);
  }, [loading]);

  // Function to handle course deletion
  const handleCourseDelete = async (courseId, courseTitle, callback) => {
    try {
      Alert.alert(
        'Delete Course',
        `Are you sure you want to remove "${courseTitle}" from your courses?`,
        [
          {
            text: 'Delete Course',
            onPress: async () => {
              try {
                // Call API to remove the course
                await removeFromCurrentCourses(courseId);
                console.log(`Course removed successfully: ${courseTitle}`);
                // Call the callback function to refresh the courses list
                if (callback) callback();
              } catch (error) {
                console.error('Failed to delete course:', error);
                Alert.alert('Error', 'Failed to delete the course. Please try again.');
              }
            },
            style: 'destructive',
          },
          {
            text: 'Nevermind',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error in course deletion:', error);
    }
  };

  // Function to handle options
  const handleCourseOptions = (course) => {
    Alert.alert(
      'Course Options',
      course.title,
      [
        {
          text: 'Delete Course',
          onPress: () => {
            handleCourseDelete(course.id, course.title, () => {
              // Reset and refresh the courses when a course is deleted
              initialLoadComplete.current = false;
              fetchUserCourses();
            });
          },
          style: 'destructive', // Red color
        },
        {
          text: 'Nevermind',
          style: 'cancel', // Default blue color
        },
      ],
      { cancelable: true }
    );
  };

  // Function to fetch user's courses
  const fetchUserCourses = async (showLoadingUI = true) => {
    try {
      console.log('📊 HomeScreen: Starting fetchUserCourses', { showLoadingUI, refreshing });
      
      if (showLoadingUI) {
        setLoading(true);
        setVisibleLoading(true);
      }
      
      setError(null);
      console.log('Fetching courses from API...');
      const courses = await getMyCourses();
      
      console.log('Fetched courses from API:', courses.length, 'courses');
      
      // Filter out completed courses (all sections completed)
      const completed = courses.filter(course => {
        if (!course.sections || course.sections.length === 0) return false;
        return course.sections.every(section => section.isCompleted);
      });
      
      console.log('Completed courses count:', completed.length);
      
      // Format completed courses for display
      const formattedCompletedCourses = completed.map((course, index) => {
        const courseTitle = course.title || course.course_name || 'Untitled Course';
        
        return {
          id: course.course_id || course._id,
          title: courseTitle,
          // Assign a default icon based on index
          icon: getCourseIcon(course, index),
          progress: 100, // 100% completed
          // Store the original course data for details view
          courseData: { 
            ...course, 
            title: courseTitle, 
            course_name: courseTitle,
            // Make sure sections are marked as completed
            sections: course.sections ? course.sections.map(section => ({
              ...section,
              isCompleted: true
            })) : []
          }
        };
      });
      
      // Sort by most recently active or created
      setCompletedCourses(formattedCompletedCourses);
      
      // Consider ANY course that isn't 100% complete as an active course
      // This includes courses with no progress, partially completed, or with no sections
      const activeCourses = courses.filter(course => {
        // If there are no sections, it's still considered active
        if (!course.sections || course.sections.length === 0) return true;
        
        // A course is active if at least one section is not completed
        return !course.sections.every(section => section.isCompleted);
      });
      
      console.log('Active courses count:', activeCourses.length);
      console.log('Active courses:', JSON.stringify(activeCourses.map(c => c.title || c.course_name), null, 2));
      
      // Map in-progress courses to include icons and format for CourseCard
      const formattedCourses = activeCourses.map((course, index) => {
        // Get the correct title from the course data - handle both title and course_name
        const courseTitle = course.title || course.course_name || 'Untitled Course';
        
        console.log(`Formatting course: ${courseTitle}`);
        
        const extractedId = course.course_id || course._id;
        
        // Calculate progress for sorting purposes
        const progress = calculateProgress(course);
        
        const formattedCourse = {
          id: extractedId,
          title: courseTitle,
          // Assign a default icon based on index
          icon: getCourseIcon(course, index),
          // Calculate progress based on completed sections
          progress,
          // Store the original course data for details view
          courseData: {
            ...course,
            // Ensure both title and course_name are set for backward compatibility
            title: courseTitle,
            course_name: courseTitle
          }
        };
        
        return formattedCourse;
      });
      
      // Sort courses by progress percentage (descending) and alphabetically for ties
      const sortedCourses = formattedCourses.sort((a, b) => {
        // Sort by progress first (highest first)
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        // If progress is tied, sort alphabetically
        return a.title.localeCompare(b.title);
      });
      
      console.log('Sorted active courses count:', sortedCourses.length);
      console.log('Top 3 courses:', sortedCourses.slice(0, 3).map(c => c.title));
      
      setUserCourses(sortedCourses);
      initialLoadComplete.current = true;
      
      // Handle different loading states
      if (showLoadingUI) {
        // Slightly delay hiding the loading state to ensure smooth transition
        setTimeout(() => {
          setVisibleLoading(false);
          setLoading(false);
          console.log('📊 HomeScreen: Course loading complete (with UI)');
        }, 500);
      } else {
        // For pull-to-refresh, immediately update
        setVisibleLoading(false);
        setLoading(false);
        console.log('📊 HomeScreen: Course loading complete (refresh)');
      }
      
      // Always turn off refreshing state
      if (refreshing) {
        console.log('🔄 HomeScreen: Turning off refresh indicator');
        setRefreshing(false);
      }
      
      console.log('Course data fetch completed successfully');
    } catch (err) {
      console.error('❌ HomeScreen: Failed to fetch user courses:', err);
      setError('Could not load your courses');
      setLoading(false);
      setVisibleLoading(false);
      
      // Always ensure refreshing state is turned off
      if (refreshing) {
        console.log('🔄 HomeScreen: Turning off refresh indicator (error)');
        setRefreshing(false);
      }
      
      // Add user-friendly error if triggered by pull-to-refresh
      if (refreshing) {
        Alert.alert(
          'Connection Error',
          'Could not refresh your courses. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Refresh courses when screen comes into focus, but only on first mount
  useFocusEffect(
    useCallback(() => {
      // Always refresh data when screen comes into focus to ensure deleted courses are reflected
      console.log('🏠 HomeScreen focused - refreshing data');
      fetchUserCourses();
      
      return () => {
        // Cleanup function when screen loses focus (if needed)
        console.log('🏠 HomeScreen unfocused');
      };
    }, []) // Empty dependency array means this only depends on screen focus
  );

  // Handle pull-to-refresh
  // This allows users to pull down from the top of the screen to refresh their course data
  // Useful when courses are added, removed, or course progress has been updated
  const onRefresh = useCallback(() => {
    console.log('🔄 Pull-to-refresh triggered on HomeScreen');
    setRefreshing(true);
    setError(null); // Clear any existing errors
    
    // Always fetch fresh data, resetting the cache
    initialLoadComplete.current = false;
    fetchUserCourses(false); // Don't show skeleton loaders during pull-to-refresh
  }, []);

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
    console.log('Rendering active courses, count:', userCourses.length);
    
    if (visibleLoading) {
      return <SkeletonLoader variant="course" count={3} />;
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

    // Always show 3 slots
    const displayCourses = [];
    const activeCourseCount = userCourses.length;
    
    // Take only the top 3 most progressed courses
    const topCourses = userCourses.slice(0, 3);
    console.log('Top courses to display:', topCourses.length);
    
    // Add actual courses first
    for (let i = 0; i < 3; i++) {
      if (i < topCourses.length) {
        // We have an actual course
        displayCourses.push({
          type: 'course',
          course: topCourses[i]
        });
      } else {
        // Add a placeholder for missing courses
        displayCourses.push({
          type: 'placeholder'
        });
      }
    }
    
    console.log('Display courses (including placeholders):', displayCourses.length);

    return (
      <View style={styles.verticalCoursesContainer}>
        {displayCourses.map((item, index) => {
          if (item.type === 'placeholder') {
            // Return a placeholder/empty card
            console.log(`Rendering placeholder at index ${index}`);
            return (
              <View key={`placeholder-${index}`} style={styles.placeholderCard}>
                {activeCourseCount === 0 && index === 0 && (
                  <Typography variant="body" style={styles.emptyCourseText}>
                    You don't have any active courses yet.
                  </Typography>
                )}
              </View>
            );
          }
          
          // Return a real course card
          console.log(`Rendering course at index ${index}: ${item.course.title}`);
          return (
            <CourseCard
              key={item.course.id}
              course={item.course}
              style={styles.verticalCourseCard}
              onPress={() => handleNavigation('CourseSections', { 
                courseId: item.course.id,
                courseData: item.course.courseData
              })}
              onOptionsPress={() => handleCourseOptions(item.course)}
            />
          );
        })}
      </View>
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
              Explore
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
              Generate A Course
            </Typography>
          </View>
        </Card>
      </View>
    );
  };
  
  // Render Completed Courses - replacing the Friends Courses section
  const renderCompletedCourses = () => {
    if (visibleLoading) {
      return <SkeletonLoader variant="course" count={2} />;
    }
    
    if (completedCourses.length === 0) {
      return (
        <Typography variant="body" style={styles.emptyCourseText}>
          Complete a course to see it here!
        </Typography>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {completedCourses.map((course) => (
          <CourseCard 
            key={course.id}
            course={course}
            style={styles.carouselCard}
            onPress={() => handleNavigation('CourseSections', { 
              courseId: course.id,
              courseData: course.courseData
            })}
            onOptionsPress={() => handleCourseOptions(course)}
          />
        ))}
      </ScrollView>
    );
  };

  // Handler for viewing all active courses
  const handleViewAllActiveCourses = () => {
    navigation.navigate('AllCourses', { initialTab: 'active' });
  };

  // Handler for viewing all completed courses
  const handleViewAllCompletedCourses = () => {
    navigation.navigate('AllCourses', { initialTab: 'completed' });
  };

  return (
    <Screen
      title="Tymelyne"
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
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary, colors.secondary]} // Android
            tintColor={colors.primary} // iOS
            progressBackgroundColor={colors.background} // Android
            progressViewOffset={0}
            title="Pull to refresh courses" // iOS
            titleColor={colors.text.secondary} // iOS
            size="default" // Android: "default" or "large"
          />
        }
      >
        {/* Show a loading banner when refreshing */}
        {refreshing && (
          <View style={styles.refreshingBanner}>
            <Typography variant="caption" color="secondary">
              Refreshing courses...
            </Typography>
          </View>
        )}

        {/* Active Courses Section */}
        <View style={styles.firstSectionTitleContainer}>
          {renderSectionTitle("Active Courses", "View All", handleViewAllActiveCourses)}
        </View>
        <View style={styles.coursesContainer}>
          {renderActiveCourses()}
        </View>

        {/* Add a Course Section */}
        {renderSectionTitle("Add a Course", null, null, styles.addCourseSectionTitle)}
        {renderAddCourseCards()}

        {/* Completed Courses Section - replacing Friends' Courses */}
        {renderSectionTitle("Completed Courses", "See More", handleViewAllCompletedCourses, styles.friendsSectionTitle)}
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
    marginBottom: spacing.m,
    minHeight: 330, // Adjusted height for 3 cards (100px each) plus margins
  },
  verticalCoursesContainer: {
    width: '100%',
    paddingTop: spacing.xs,
  },
  verticalCourseCard: {
    width: '100%',
    marginBottom: spacing.s, // Reduced margin between cards
    height: 90, // Update to match CourseCard height
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
  emptyGridSlot: {
    width: '48%',
    margin: '1%',
    height: 0, // Don't take up vertical space
  },
  placeholderCard: {
    width: '100%',
    height: 90, // Update to match CourseCard height
    marginBottom: spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: __DEV__ ? 1 : 0, // Only show border in development mode
    borderColor: __DEV__ ? colors.border : 'transparent',
    borderStyle: 'dashed',
    borderRadius: borderRadius.m,
  },
  refreshingBanner: {
    padding: spacing.s,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    marginBottom: spacing.s,
    borderRadius: borderRadius.s,
    marginHorizontal: spacing.m,
  },
});

export default HomeScreen; 