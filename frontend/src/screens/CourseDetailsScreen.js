import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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

const { width } = Dimensions.get('window');

const CourseDetailsScreen = ({ navigation, route }) => {
  // In a real app, we would get the course details from the route params or fetch from API
  // For now, we'll use some mock data
  const course = {
    id: 1,
    title: 'Digital Marketing',
    description: 'Learn the fundamentals of digital marketing including SEO, social media, content marketing, and more.',
    progress: 25,
    totalModules: 4,
    completedModules: 1,
    quizzes: [
      { id: 1, title: 'SEO Basics', questions: 10, completed: true },
      { id: 2, title: 'Social Media Marketing', questions: 8, completed: false },
      { id: 3, title: 'Content Marketing', questions: 12, completed: false },
      { id: 4, title: 'Email Marketing', questions: 9, completed: false }
    ],
    icon: require('../../assets/course-icons/marketing.png')
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Handle taking a quiz
  const handleTakeQuiz = (quizId) => {
    // In a real app, navigate to the quiz screen with the quiz ID
    navigation.navigate('Development');
  };

  return (
    <Screen
      title="Course Details"
      onBackPress={handleBackPress}
      backgroundColor={theme.colors.background.main}
      showBottomNav={false}
    >
      {/* Course Banner */}
      <View style={styles.courseHeader}>
        <Image source={course.icon} style={styles.courseIcon} />
        <Text style={styles.courseTitle}>{course.title}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={course.progress} 
            label={`${course.completedModules}/${course.totalModules} Modules Completed`}
          />
        </View>
      </View>

      {/* Course Description */}
      <SectionTitle title="Description" />
      <Card>
        <Text style={styles.description}>{course.description}</Text>
      </Card>

      {/* Quizzes Section */}
      <SectionTitle title="Practice Quizzes" />

      {course.quizzes.map(quiz => (
        <Card
          key={quiz.id}
          style={[
            styles.quizCard,
            quiz.completed && styles.completedQuizCard
          ]}
          onPress={() => handleTakeQuiz(quiz.id)}
        >
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizQuestions}>{quiz.questions} Questions</Text>
          </View>
          <View style={styles.quizStatus}>
            {quiz.completed ? (
              <Text style={styles.completedText}>✓ Completed</Text>
            ) : (
              <Text style={styles.takeQuizText}>Take Quiz ›</Text>
            )}
          </View>
        </Card>
      ))}

      {/* Action buttons */}
      <View style={styles.actionButtonsContainer}>
        <Button 
          title="Continue Learning" 
          onPress={() => navigation.navigate('Development')}
          style={styles.continueButton}
        />
      </View>
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
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.ui.success,
    fontWeight: theme.typography.fontWeight.medium,
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
});

export default CourseDetailsScreen; 