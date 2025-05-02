import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import CourseCard from '../components/CourseCard';
import Typography from '../components/Typography';
import SkeletonLoader from '../components/SkeletonLoader';
import { colors, spacing, borderRadius } from '../constants/theme';
import { getMyCourses, removeFromCurrentCourses } from '../services/courseService';

/**
 * Screen for displaying all courses with a toggle between active and completed
 */
const AllCoursesScreen = ({ navigation, route }) => {
  // Determine the initial active tab from navigation params or default to "active"
  const initialTab = route.params?.initialTab || 'active';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch courses data
  const fetchCourses = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const allCourses = await getMyCourses();
      console.log('Fetched all courses:', allCourses.length);
      
      // Separate active and completed courses
      const completedCourses = allCourses.filter(course => {
        if (!course.sections || course.sections.length === 0) return false;
        return course.sections.every(section => section.isCompleted);
      });
      
      const activeCourses = allCourses.filter(course => {
        if (!course.sections || course.sections.length === 0) return true;
        return !course.sections.every(section => section.isCompleted);
      });
      
      // Format courses for display
      const formattedActive = formatCourses(activeCourses);
      const formattedCompleted = formatCourses(completedCourses, true);
      
      // Sort active courses by progress (descending) and alphabetically for ties
      const sortedActive = formattedActive.sort((a, b) => {
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        return a.title.localeCompare(b.title);
      });
      
      // Set courses based on active tab
      setCourses(activeTab === 'active' ? sortedActive : formattedCompleted);
      
      setLoading(false);
      if (refreshing) setRefreshing(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  };

  // Format courses for display
  const formatCourses = (coursesList, isCompleted = false) => {
    const defaultIcons = [
      require('../../assets/course-icons/computer.png'),
      require('../../assets/course-icons/design.png'),
      require('../../assets/course-icons/finance.png'),
      require('../../assets/course-icons/marketing.png'),
    ];
    
    return coursesList.map((course, index) => {
      const courseTitle = course.title || course.course_name || 'Untitled Course';
      
      return {
        id: course._id || course.course_id,
        title: courseTitle,
        icon: defaultIcons[index % defaultIcons.length],
        progress: isCompleted ? 100 : calculateProgress(course),
        courseData: {
          ...course,
          title: courseTitle,
          course_name: courseTitle,
          sections: course.sections ? course.sections.map(section => ({
            ...section,
            isCompleted: isCompleted ? true : section.isCompleted
          })) : []
        }
      };
    });
  };

  // Handle course deletion
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
                console.log(`Course removed: ${courseId}`);
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

  // Handle course options
  const handleCourseOptions = (course) => {
    Alert.alert(
      'Course Options',
      course.title,
      [
        {
          text: 'Delete Course',
          onPress: () => handleCourseDelete(course.id, course.title, () => {
            // Refresh the courses when a course is deleted
            fetchCourses();
          }),
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

  // Calculate course progress percentage
  const calculateProgress = (course) => {
    if (!course.sections || course.sections.length === 0) return 0;
    
    const completedSections = course.sections.filter(section => section.isCompleted).length;
    return Math.round((completedSections / course.sections.length) * 100);
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses(false);
  }, []);

  // Switch between active and completed courses
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fetch courses when the tab changes
  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  // Refresh courses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCourses();
      return () => {};
    }, [])
  );

  // Render course item
  const renderCourseItem = ({ item }) => (
    <CourseCard
      course={item}
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseSections', {
        courseId: item.id,
        courseData: item.courseData
      })}
      onOptionsPress={() => handleCourseOptions(item)}
    />
  );

  return (
    <Screen
      title="All Courses"
      onBackPress={() => navigation.goBack()}
      showBottomNav={false}
      scrollable={false}
    >
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && styles.activeTabButton
          ]}
          onPress={() => handleTabChange('active')}
        >
          <Typography
            variant="subheading"
            weight={activeTab === 'active' ? 'semiBold' : 'regular'}
            color={activeTab === 'active' ? 'primary' : 'secondary'}
          >
            Active
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'completed' && styles.activeTabButton
          ]}
          onPress={() => handleTabChange('completed')}
        >
          <Typography
            variant="subheading"
            weight={activeTab === 'completed' ? 'semiBold' : 'regular'}
            color={activeTab === 'completed' ? 'primary' : 'secondary'}
          >
            Completed
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader variant="course" count={4} />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.coursesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body" style={styles.emptyText}>
                {error || 
                  (activeTab === 'active' 
                    ? "You don't have any active courses yet."
                    : "You haven't completed any courses yet."
                  )
                }
              </Typography>
            </View>
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.l,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderRadius: borderRadius.l - 2,
  },
  activeTabButton: {
    backgroundColor: colors.background,
  },
  coursesList: {
    paddingBottom: spacing.xl,
  },
  courseCard: {
    marginBottom: spacing.s,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    marginTop: spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default AllCoursesScreen; 