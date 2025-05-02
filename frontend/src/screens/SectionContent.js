import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Typography from '../components/Typography';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';
import { getCourseById, updateSectionCompletion } from '../services/courseService';

const { width } = Dimensions.get('window');

/**
 * Section Content Screen
 * Displays the content of a specific section in a course
 * 
 * @param {object} navigation - React Navigation object
 * @param {object} route - Route parameters with courseId, sectionId, sectionData, and courseData
 */
const SectionContent = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [section, setSection] = useState(null);
  const [course, setCourse] = useState(null);
  
  // Get params from route
  const courseId = route.params?.courseId;
  const sectionId = route.params?.sectionId;
  const initialSection = route.params?.section;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Section Content: Loading data with params:', { courseId, sectionId });
        
        // Check if we're returning from quiz with updated data in params
        if (route.params?.updatedSection) {
          console.log('Section Content: Using updated section data from quiz:', route.params.updatedSection);
          setSection({
            ...route.params.section,
            ...route.params.updatedSection,
            isCompleted: true
          });
          
          // If course is passed and we have the section that completed, update it
          if (route.params.courseData) {
            const updatedCourse = {...route.params.courseData};
            // Find and update the specific section
            const sectionIndex = updatedCourse.sections.findIndex(s => 
              (s._id && s._id === sectionId) || (s.id && s.id === sectionId)
            );
            
            if (sectionIndex !== -1) {
              updatedCourse.sections[sectionIndex] = {
                ...updatedCourse.sections[sectionIndex],
                isCompleted: true
              };
            }
            
            setCourse(updatedCourse);
          }
          
          setLoading(false);
          return;
        }
        
        // If section data is passed directly
        if (route.params?.section) {
          console.log('Section Content: Using passed section data:', route.params.section);
          setSection(route.params.section);
          setCourse(route.params.courseData);
          setLoading(false);
          return;
        }
        
        // Otherwise load the course to get the section
        if (courseId && sectionId) {
          console.log('Section Content: Fetching course data for:', courseId);
          const courseData = await getCourseById(courseId);
          setCourse(courseData);
          
          // Find the specific section by _id or id
          const sectionData = courseData.sections.find(s => {
            // Log the available IDs for debugging
            console.log(`Section IDs for "${s.title}":`, { 
              sectionId: sectionId,
              _id: s._id, 
              id: s.id 
            });
            
            return (s._id && s._id === sectionId) || 
                   (s._id && s._id.toString() === sectionId) ||
                   (s.id && s.id === sectionId) ||
                   (s.id && s.id.toString() === sectionId);
          });
          
          if (sectionData) {
            console.log('Section Content: Found section data:', sectionData);
            
            // Log the quiz data if it exists
            if (sectionData.hasQuiz && sectionData.quiz) {
              console.log('Quiz data found:', {
                quiz: sectionData.quiz,
                hasQuizId: !!sectionData.quiz.quiz_id,
                hasUnderscoreId: !!sectionData.quiz._id,
                quizId: sectionData.quiz.quiz_id,
                underscoreId: sectionData.quiz._id
              });
            }
            
            setSection(sectionData);
          } else {
            console.error('Section Content: Section not found in course data. Available sections:', 
              courseData.sections.map(s => ({ _id: s._id, id: s.id, title: s.title }))
            );
            setError('Section not found in course data');
          }
        } else {
          console.error('Section Content: Missing course or section information');
          setError('Missing course or section information');
        }
      } catch (err) {
        console.error('Section Content: Error loading section:', err);
        setError(err.message || 'Failed to load section content');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [courseId, sectionId, route.params]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartQuiz = () => {
    if (section && section.hasQuiz) {
      console.log('Starting quiz for section:', section.title);
      console.log('Quiz data:', section.quiz);
      
      navigation.navigate('SectionQuiz', {
        courseId: courseId,
        sectionId: sectionId,
        section: section,
        sectionTitle: section.title,
        quiz: section.quiz || null,
        courseData: course
      });
    } else if (section) {
      // If there's no quiz, we can mark the section as completed directly
      try {
        updateSectionCompletion(courseId, sectionId, true)
          .then(result => {
            console.log('Section marked as completed (no quiz):', result);
            
            // Update local state
            setSection({...section, isCompleted: true});
            
            // Show success message
            Alert.alert(
              "Section Completed",
              `You've completed this section${result.progressData ? ` and earned XP!` : ''}`,
              [{ text: "OK" }]
            );
          })
          .catch(error => {
            console.error('Error updating section completion status:', error);
          });
      } catch (error) {
        console.error('Error updating section completion:', error);
      }
    }
  };

  if (loading) {
    return (
      <Screen
        title="Loading Content"
        onBackPress={handleBackPress}
        backgroundColor={colors.background}
        showBottomNav={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="body1" style={styles.loadingText}>
            Loading section content...
          </Typography>
        </View>
      </Screen>
    );
  }
  
  if (error || !section) {
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
            Content Unavailable
          </Typography>
          <Typography variant="body1" style={styles.errorMessage}>
            {error || 'Section content could not be loaded'}
          </Typography>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={section.title}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <Typography variant="h1" weight="bold" style={styles.title}>
            {section.title}
          </Typography>
          
          <Typography variant="body1" style={styles.description}>
            {section.description}
          </Typography>
          
          <View style={styles.statusContainer}>
            {section.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={colors.status.success} 
                />
                <Typography 
                  variant="label" 
                  color={colors.status.success}
                  style={styles.statusText}
                >
                  Completed
                </Typography>
              </View>
            )}
            
            {section.hasQuiz && (
              <TouchableOpacity
                style={styles.quizBadge}
                onPress={handleStartQuiz}
              >
                <Ionicons name="help-circle" size={20} color={colors.primary} />
                <Typography variant="label" color={colors.primary} style={styles.statusText}>
                  Take Quiz
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </Card>
        
        <Card style={styles.contentCard}>
          <Typography variant="body1" style={styles.contentText}>
            {section.content || "No content available for this section yet."}
          </Typography>
        </Card>
        
        {section.hasQuiz && (
          <View style={styles.buttonsContainer}>
            <Button
              onPress={handleStartQuiz}
              style={styles.quizButton}
              textStyle={styles.quizButtonText}
              variant="primary"
              size="large"
            >
              Take Practice Quiz
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
  },
  headerCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  title: {
    marginBottom: spacing.s,
  },
  description: {
    marginBottom: spacing.m,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.status.successLight,
    marginRight: 'auto', // This pushes it to the left
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  statusText: {
    marginLeft: spacing.xs,
  },
  contentCard: {
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  contentText: {
    lineHeight: 24,
  },
  buttonsContainer: {
    marginTop: spacing.m,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  quizButton: {
    width: '100%',
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.m,
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  loadingText: {
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

export default SectionContent; 