import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Screen, Card, Button, Typography, SectionTitle, theme } from '../components';
import { getCourseById, addToCurrentCourses } from '../services/courseService';
import { Ionicons } from '@expo/vector-icons';

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error(`Error fetching course ${courseId}:`, err);
        setError('Could not load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await addToCurrentCourses(courseId);
      Alert.alert(
        'Success',
        'You have been enrolled in this course!',
        [
          {
            text: 'View My Courses',
            onPress: () => navigation.navigate('Home'),
          },
          {
            text: 'View Course',
            onPress: () => navigation.navigate('CourseSections', { 
              courseId: courseId,
              courseData: course
            }),
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Typography variant="heading">Error</Typography>
          <Typography variant="body" style={styles.errorText}>{error}</Typography>
          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
            style={styles.errorButton}
          />
        </View>
      </Screen>
    );
  }

  if (!course) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Typography variant="heading">Course Not Found</Typography>
          <Typography variant="body" style={styles.errorText}>
            The course you're looking for doesn't exist or you don't have permission to view it.
          </Typography>
          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
            style={styles.errorButton}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Course Details" showBackButton onBackPress={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <Card style={styles.courseHeader}>
          <Typography variant="heading" style={styles.courseTitle}>
            {course.title}
          </Typography>
          
          <View style={styles.courseMetaRow}>
            <View style={styles.courseMeta}>
              <Ionicons name="star" size={16} color={theme.colors.primary} />
              <Typography variant="caption" style={styles.metaText}>
                {course.difficulty || 'Beginner'}
              </Typography>
            </View>
            
            <View style={styles.courseMeta}>
              <Ionicons name="layers" size={16} color={theme.colors.primary} />
              <Typography variant="caption" style={styles.metaText}>
                {course.sections?.length || 0} sections
              </Typography>
            </View>
            
            <View style={styles.courseMeta}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Typography variant="caption" style={styles.metaText}>
                {/* Estimate 10 min per section */}
                ~{(course.sections?.length || 0) * 10} mins
              </Typography>
            </View>
          </View>
        </Card>
        
        <Card style={styles.descriptionCard}>
          <SectionTitle title="Description" style={styles.sectionTitle} />
          <Typography variant="body" style={styles.description}>
            {course.description}
          </Typography>
        </Card>
        
        <SectionTitle title="Course Content" style={styles.sectionTitle} />
        
        {course.sections && course.sections.length > 0 ? (
          course.sections.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Typography variant="subheading" style={styles.sectionTitle}>
                  {index + 1}. {section.title}
                </Typography>
              </View>
              <Typography variant="body" style={styles.sectionDescription}>
                {section.description}
              </Typography>
            </Card>
          ))
        ) : (
          <Card style={styles.emptySectionsCard}>
            <Typography variant="body" style={styles.emptyText}>
              No sections available for this course.
            </Typography>
          </Card>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title={enrolling ? "Enrolling..." : "Enroll Now"}
            onPress={handleEnroll}
            disabled={enrolling}
            style={styles.enrollButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.s,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: theme.spacing.m,
    color: theme.colors.text.secondary,
  },
  errorButton: {
    marginTop: theme.spacing.m,
  },
  courseHeader: {
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  courseTitle: {
    fontSize: 24,
    marginBottom: theme.spacing.s,
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.s,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  metaText: {
    marginLeft: 4,
    color: theme.colors.text.secondary,
  },
  descriptionCard: {
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  description: {
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: theme.spacing.s,
  },
  sectionCard: {
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    color: theme.colors.text.secondary,
  },
  emptySectionsCard: {
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  enrollButton: {
    marginVertical: theme.spacing.s,
  }
});

export default CourseDetailScreen; 