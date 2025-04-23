import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator
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
        if (initialSection) {
          // If we already have the section data, use it
          setSection(initialSection);
          setLoading(false);
          return;
        }
        
        // Otherwise load the course to get the section
        if (courseId && sectionId) {
          const courseData = await getCourseById(courseId);
          setCourse(courseData);
          
          // Find the specific section
          const sectionData = courseData.sections.find(s => 
            s._id === sectionId || s.id === sectionId
          );
          
          if (sectionData) {
            setSection(sectionData);
          } else {
            setError('Section not found');
          }
        } else {
          setError('Missing course or section information');
        }
      } catch (err) {
        console.error('Error loading section:', err);
        setError(err.message || 'Failed to load section content');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [courseId, sectionId, initialSection]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMarkComplete = async () => {
    try {
      // Optimistically update UI
      setSection(prev => ({
        ...prev,
        isCompleted: !prev.isCompleted
      }));
      
      // Send to backend
      if (courseId && sectionId) {
        await updateSectionCompletion(courseId, sectionId, !section.isCompleted);
      }
      
      // Optional: Show success message
    } catch (err) {
      console.error('Failed to update completion status:', err);
      // Revert the optimistic update
      setSection(prev => ({
        ...prev,
        isCompleted: !prev.isCompleted
      }));
    }
  };

  const handleStartQuiz = () => {
    if (section && section.hasQuiz) {
      navigation.navigate('SectionQuiz', {
        courseId: courseId,
        sectionId: sectionId,
        sectionTitle: section.title,
        quiz: section.quiz
      });
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
            <TouchableOpacity
              style={[
                styles.statusBadge,
                section.isCompleted ? styles.completedBadge : styles.notCompletedBadge
              ]}
              onPress={handleMarkComplete}
            >
              <Ionicons 
                name={section.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={section.isCompleted ? colors.status.success : colors.text.secondary} 
              />
              <Typography 
                variant="label" 
                color={section.isCompleted ? colors.status.success : colors.text.secondary}
                style={styles.statusText}
              >
                {section.isCompleted ? "Completed" : "Mark as Completed"}
              </Typography>
            </TouchableOpacity>
            
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
        
        <View style={styles.buttonsContainer}>
          {section.hasQuiz && (
            <Button
              title="Start Quiz"
              onPress={handleStartQuiz}
              style={styles.quizButton}
              variant="primary"
            />
          )}
          
          <Button
            title={section.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
            onPress={handleMarkComplete}
            style={styles.completeButton}
            variant={section.isCompleted ? "secondary" : "primary"}
          />
        </View>
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
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: 20,
  },
  completedBadge: {
    backgroundColor: colors.status.successLight,
  },
  notCompletedBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
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
  },
  quizButton: {
    marginBottom: spacing.s,
  },
  completeButton: {
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