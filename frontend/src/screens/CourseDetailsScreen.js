import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F1E0" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Course Banner */}
          <View style={styles.courseHeader}>
            <Image source={course.icon} style={styles.courseIcon} />
            <Text style={styles.courseTitle}>{course.title}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{course.progress}% Complete</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${course.progress}%` }]} />
              </View>
              <Text style={styles.modulesText}>
                {course.completedModules}/{course.totalModules} Modules Completed
              </Text>
            </View>
          </View>

          {/* Course Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Quizzes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practice Quizzes</Text>

            {course.quizzes.map(quiz => (
              <TouchableOpacity
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
              </TouchableOpacity>
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
  },
  backButtonContainer: {
    padding: 5, // Increase touch area
  },
  backButton: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  placeholder: {
    width: 34, // Balance for back button with padding
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Extra padding at the bottom
  },
  courseHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  courseIcon: {
    width: width * 0.2, // Responsive width
    height: width * 0.2, // Keep aspect ratio
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: width > 375 ? 24 : 22, // Slightly smaller on smaller devices
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B6B5A',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0D8C0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden', // Ensure the progress bar doesn't overflow
  },
  progress: {
    height: '100%',
    backgroundColor: '#D35C34',
    borderRadius: 4,
  },
  modulesText: {
    fontSize: 14,
    color: '#6B6B5A',
    textAlign: 'right',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4A4A3A',
    lineHeight: 24,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedQuizCard: {
    borderColor: '#6AB04A',
    borderLeftWidth: 4,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 4,
  },
  quizQuestions: {
    fontSize: 14,
    color: '#6B6B5A',
  },
  quizStatus: {
    marginLeft: 16,
    paddingLeft: 8,
  },
  takeQuizText: {
    color: '#D35C34',
    fontWeight: 'bold',
    fontSize: 15,
  },
  completedText: {
    color: '#6AB04A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionButtonsContainer: {
    marginVertical: 24,
  },
  continueButton: {
    backgroundColor: '#D35C34',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CourseDetailsScreen; 