import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import Typography from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { getCourseById, updateSectionCompletion } from '../services/courseService';

const { width } = Dimensions.get('window');

const CourseDetailsScreen = ({ navigation, route }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Course ID can come from route params or already loaded course object
  const courseId = route.params?.courseId;
  const initialCourse = route.params?.course;
  
  useEffect(() => {
    const loadCourse = async () => {
      try {
        // If we already have the full course data, use it
        if (initialCourse && initialCourse.sections) {
          console.log('Using provided course data:', initialCourse.title);
          setCourse(initialCourse);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API by ID
        if (courseId) {
          console.log('Fetching course by ID:', courseId);
          const data = await getCourseById(courseId);
          setCourse(data);
        } else {
          // Fallback to mock data for development only
          console.log('No course ID provided, using mock data');
          setCourse(mockCourse);
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError(err.message || 'Failed to load course');
        setCourse(defaultCourse);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId, initialCourse]);
  
  // Mock data for development and fallback
  const mockCourse = {
    id: 1,
    course_id: 1,
    title: 'Digital Marketing',
    description: 'Master the essential skills and strategies needed for effective digital marketing campaigns.',
    sections: [
      {
        id: 1,
        title: 'Introduction to Digital Marketing',
        description: 'Learn the fundamentals of digital marketing including key concepts, channels, and metrics for measuring success.',
        isCompleted: false,
        hasQuiz: true
      },
      {
        id: 2,
        title: 'Content Marketing Strategy',
        description: 'Develop effective content marketing strategies that drive engagement and conversions across different platforms.',
        isCompleted: true,
        hasQuiz: true
      },
      {
        id: 3,
        title: 'Social Media Marketing',
        description: 'Master social media marketing tactics for the major platforms including content creation, community management, and paid advertising.',
        isCompleted: false,
        hasQuiz: true
      }
    ]
  };
  
  const defaultCourse = {
    id: 0,
    course_id: 0,
    title: 'Course Not Found',
    description: 'This course could not be loaded.',
    sections: []
  };

  const handleBackPress = () => {
    navigation && navigation.goBack();
  };

  const handleSectionPress = (sectionId) => {
    if (navigation && course) {
      navigation.navigate('SectionContent', { 
        courseId: course.course_id || course.id, 
        sectionId,
        section: course.sections.find(s => s._id === sectionId || s.id === sectionId)
      });
    }
  };
  
  const handleSectionCompletionToggle = async (sectionId, currentStatus) => {
    try {
      // Optimistically update the UI
      setCourse(prevCourse => {
        const updatedSections = prevCourse.sections.map(section => 
          (section._id === sectionId || section.id === sectionId) 
            ? {...section, isCompleted: !currentStatus} 
            : section
        );
        return {...prevCourse, sections: updatedSections};
      });
      
      // Send to backend
      if (course.course_id) {
        await updateSectionCompletion(course.course_id, sectionId, !currentStatus);
      }
    } catch (err) {
      console.error('Failed to update section completion:', err);
      // Revert the optimistic update on error
      setCourse(prevCourse => {
        const updatedSections = prevCourse.sections.map(section => 
          (section._id === sectionId || section.id === sectionId) 
            ? {...section, isCompleted: currentStatus} 
            : section
        );
        return {...prevCourse, sections: updatedSections};
      });
    }
  };

  if (loading) {
    return (
      <Screen
        title="Loading Course"
        onBackPress={handleBackPress}
        backgroundColor={colors.background}
        showBottomNav={false}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="body1" style={styles.loaderText}>
            Loading course content...
          </Typography>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen
        title="Error"
        onBackPress={handleBackPress}
        backgroundColor={colors.background}
        showBottomNav={false}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
          <Typography variant="h2" style={styles.errorTitle}>
            Failed to Load Course
          </Typography>
          <Typography variant="body1" style={styles.errorMessage}>
            {error}
          </Typography>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={course.title}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      <View style={styles.courseHeader}>
        <Typography variant="h1" weight="bold" style={styles.courseTitle}>
          {course.title}
        </Typography>
        
        <Typography variant="body1" style={styles.courseDescription}>
          {course.description}
        </Typography>
      </View>

      <SectionTitle title="Course Content" />
      
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section) => (
          <Card
            key={section._id || section.id}
            style={styles.sectionCard}
            variant="elevated"
            onPress={() => handleSectionPress(section._id || section.id)}
          >
            <Typography variant="subheading" weight="semiBold" style={styles.sectionTitle}>
              {section.title}
            </Typography>
            
            <Typography variant="body2" color={colors.text.secondary} style={styles.sectionDescription} numberOfLines={3}>
              {section.description}
            </Typography>
            
            <View style={styles.sectionFooter}>
              {section.isCompleted ? (
                <View style={styles.completedBadge}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={colors.status.success} 
                    onPress={() => handleSectionCompletionToggle(section._id || section.id, true)}
                  />
                  <Typography variant="label" color={colors.status.success} style={styles.completedText}>
                    Completed
                  </Typography>
                </View>
              ) : (
                <View style={styles.notCompletedBadge}>
                  <Ionicons 
                    name="ellipse-outline" 
                    size={20} 
                    color={colors.text.secondary}
                    onPress={() => handleSectionCompletionToggle(section._id || section.id, false)}
                  />
                  <Typography variant="label" color={colors.text.secondary} style={styles.completedText}>
                    Not Completed
                  </Typography>
                </View>
              )}
              
              {section.hasQuiz && (
                <View style={styles.quizBadge}>
                  <Ionicons name="help-circle" size={18} color={colors.primary} />
                  <Typography variant="label" color={colors.primary} style={styles.quizText}>
                    Quiz
                  </Typography>
                </View>
              )}
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.sectionCard}>
          <Typography variant="body" style={styles.noContentMessage}>
            No course content available yet.
          </Typography>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  courseHeader: {
    alignItems: 'center',
    marginVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  courseTitle: {
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  courseDescription: {
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  sectionCard: {
    marginBottom: spacing.m,
    marginHorizontal: spacing.m,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    lineHeight: 20,
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    marginLeft: spacing.xs,
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizText: {
    marginLeft: spacing.xs,
  },
  noContentMessage: {
    textAlign: 'center',
    marginVertical: spacing.m,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  loaderText: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  errorTitle: {
    marginTop: spacing.m,
    marginBottom: spacing.s,
    textAlign: 'center', 
  },
  errorMessage: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default CourseDetailsScreen; 