import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { 
  Screen, 
  Card, 
  ProgressBar, 
  SectionTitle,
  Button,
  theme 
} from '../components';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

const CourseDetailsScreen = ({ navigation, route }) => {
  // In a real app, we would get the course details from the route params or fetch from API
  // For now, we'll use some mock data
  const course = {
    id: 1,
    title: 'Digital Marketing',
    sections: [
      {
        id: 1,
        title: 'Section Title',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
        isCompleted: false,
        hasQuiz: true
      },
      {
        id: 2,
        title: 'Section Title',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
        isCompleted: false,
        hasQuiz: true
      },
      {
        id: 3,
        title: 'Section Title',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
        isCompleted: false,
        hasQuiz: true
      }
    ]
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSectionPress = (sectionId) => {
    navigation.navigate('SectionContent', { courseId: course.id, sectionId });
  };

  return (
    <Screen
      title={course.title}
      onBackPress={handleBackPress}
      backgroundColor="#F9F1E0"
      showBottomNav={false}
      scrollable={true}
    >
      {course.sections.map((section) => (
        <Card
          key={section.id}
          style={styles.sectionCard}
          backgroundColor="#F9F1E0"
          onPress={() => handleSectionPress(section.id)}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDescription} numberOfLines={3}>
            {section.description}
          </Text>
          {section.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  courseHeader: {
    alignItems: 'center',
    marginVertical: theme.spacing.m,
  },
  courseIcon: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: theme.spacing.m,
  },
  courseTitle: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: theme.spacing.s,
  },
  description: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    marginTop: 0,
  },
  completedQuizCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.ui.success,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  quizQuestions: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  quizStatus: {
    marginLeft: theme.spacing.m,
  },
  completedText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  takeQuizText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionButtonsContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  continueButton: {
    width: '100%',
  },
  sectionCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
});

export default CourseDetailsScreen; 