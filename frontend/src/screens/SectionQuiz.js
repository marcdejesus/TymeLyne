import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform,
  Text
} from 'react-native';
import Screen from '../components/Screen';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';
import { updateSectionCompletion, getCourseById } from '../services/courseService';
import { useUserProgression } from '../contexts/UserProgressionContext';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Memoized option component for better performance
const QuizOption = memo(({ index, option, selectedOption, onSelect }) => (
  <TouchableOpacity 
    style={[
      styles.optionContainer,
      selectedOption === index && styles.selectedOption
    ]}
    onPress={() => onSelect(index)}
    activeOpacity={0.7}
  >
    <View style={[
      styles.optionCircle,
      selectedOption === index && styles.selectedCircle
    ]}>
      {selectedOption === index && (
        <View style={styles.optionInnerCircle} />
      )}
    </View>
    <Typography 
      variant="body2" 
      style={styles.optionText}
      color={selectedOption === index ? "primary" : "primary"}
    >
      {option}
    </Typography>
  </TouchableOpacity>
));

const SectionQuiz = ({ navigation, route }) => {
  console.log('SectionQuiz - Component mounted');
  
  // Store initial route params in a ref to prevent issues with route.params changes
  const initialParams = useRef(route.params).current;
  const { courseId, sectionId, sectionTitle, quiz, experiencePoints = 250 } = initialParams;
  const { updateProgression } = useUserProgression();
  
  // Add unmount logger
  useEffect(() => {
    return () => {
      console.log('SectionQuiz - Component unmounted');
    };
  }, []);
  
  // Quiz state - use refs for values that shouldn't trigger re-renders
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizFailed, setQuizFailed] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  // Helper function to get correct answer index from any question format
  const getCorrectAnswerIndex = useCallback((question) => {
    // Check all possible correct answer property names
    if (question.correctOption !== undefined) return question.correctOption;
    if (question.correctAnswer !== undefined) return question.correctAnswer;
    if (question.correct_option !== undefined) return question.correct_option;
    if (question.correct_answer !== undefined) return question.correct_answer;
    
    // If no correct answer property is found, log error and return null
    console.error('No correct answer property found in question:', question);
    return null;
  }, []);
  
  // Initialize quiz questions from the passed quiz data or use mock data if not available
  useEffect(() => {
    console.log('Quiz data received:', quiz);
    
    if (quiz) {
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('Using real quiz data with', quiz.questions.length, 'questions');
        console.log('First question structure:', JSON.stringify(quiz.questions[0], null, 2));
        setQuestions(quiz.questions);
      } else {
        console.warn('Quiz object exists but no questions found');
        loadMockData();
      }
    } else {
      console.warn('No quiz data provided, using mock data instead');
      loadMockData();
    }
  }, [quiz]);
  
  const loadMockData = useCallback(() => {
    // Mock quiz questions as fallback
    setQuestions([
      {
        _id: '1',
        question: 'What is the primary focus of digital marketing?',
        options: [
          'Building offline brand awareness',
          'Promoting products and services through digital channels',
          'Creating physical advertising materials',
          'Reducing marketing budgets'
        ],
        correctOption: 1,
        correctAnswer: 1
      },
      {
        _id: '2',
        question: 'Which of the following is NOT a common digital marketing channel?',
        options: [
          'Social media marketing',
          'Email marketing',
          'Billboard advertising',
          'Search engine optimization'
        ],
        correctOption: 2,
        correctAnswer: 2
      },
      {
        _id: '3',
        question: 'What does SEO stand for in digital marketing?',
        options: [
          'Social Engagement Optimization',
          'Search Engine Optimization',
          'Sales Enhancement Operations',
          'System Enhancement Oversight'
        ],
        correctOption: 1,
        correctAnswer: 1
      }
    ]);
  }, []);

  const handleBackPress = useCallback(() => {
    if (quizStarted && !quizCompleted && !quizFailed) {
      Alert.alert(
        "Quit Quiz?",
        "Are you sure you want to quit? Your progress will be lost.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Quit",
            onPress: () => navigation.goBack(),
            style: "destructive"
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [quizStarted, quizCompleted, quizFailed, navigation]);

  const handleStartQuiz = useCallback(() => {
    // Reset and start the quiz
    setQuizStarted(true);
  }, []);

  const handleSelectOption = useCallback((index) => {
    setSelectedOption(index);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      console.warn('No questions available or index out of bounds');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    console.log('Checking answer for question:', currentQuestion);
    console.log('Selected option index:', selectedOption);
    
    // Check for both correctOption and correctAnswer properties
    const correctAnswerIndex = getCorrectAnswerIndex(currentQuestion);
    
    console.log('Correct answer index:', correctAnswerIndex);
    
    if (correctAnswerIndex === null) {
      console.error('Could not find correct answer in question data');
      return;
    }
    
    const isCorrect = selectedOption === correctAnswerIndex;
    console.log('Answer is correct:', isCorrect);
    
    if (!isCorrect) {
      // If any answer is incorrect, fail the quiz
      setQuizFailed(true);
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question if answer was correct
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // All questions answered correctly, complete the quiz
      setQuizCompleted(true);
      
      // Mark the section as completed
      try {
        updateSectionCompletion(courseId, sectionId, true)
          .then(result => {
            console.log('Section marked as completed:', result);
            
            // Update the progression data in context
            if (result && result.progressData) {
              // Save this in route params to pass back later
              initialParams.updatedProgressData = result.progressData;
              
              // Update the global progression context
              updateProgression(result.progressData);
            }
            
            // If we received an updated section, store it too
            if (result && result.section) {
              initialParams.updatedSection = result.section;
            }
          })
          .catch(error => {
            console.error('Error updating section completion status:', error);
          });
      } catch (error) {
        console.error('Error updating section completion:', error);
      }
    }
  }, [questions, currentQuestionIndex, selectedOption, courseId, sectionId, initialParams, updateProgression, getCorrectAnswerIndex]);

  const handleRetry = useCallback(() => {
    // Reset quiz state
    setQuizFailed(false);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
  }, []);

  const handleGoHome = useCallback(() => {
    // Navigate back to course sections
    try {
      getCourseById(courseId)
        .then(updatedCourseData => {
          console.log('Updated course data after completion');
          
          // Navigate back with the fresh course data
          navigation.navigate('CourseSections', { 
            courseId, 
            courseData: updatedCourseData,
            refreshTimestamp: Date.now() // Force refresh by changing a param
          });
        })
        .catch(error => {
          console.error('Failed to fetch updated course data:', error);
          
          // If we have updated progression data from completion, use it
          const navigationParams = { courseId };
          
          if (initialParams.updatedProgressData) {
            navigationParams.updatedProgressData = initialParams.updatedProgressData;
          }
          
          if (initialParams.course) {
            // Use the original course data if available
            navigationParams.courseData = initialParams.course;
          }
          
          // Navigate back with whatever data we have
          navigation.navigate('CourseSections', navigationParams);
        });
    } catch (error) {
      console.error('Error in handleGoHome:', error);
      navigation.navigate('CourseSections', { courseId });
    }
  }, [navigation, courseId, initialParams]);

  // Memoize render functions to prevent unnecessary re-renders
  const renderQuizIntro = useCallback(() => (
    <View style={styles.introContainer}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Typography variant="heading" weight="bold" style={styles.quizTimeText}>
        Quiz Challenge!
      </Typography>
      <Typography variant="body" style={styles.quizDescription} center>
        {sectionTitle ? `Test your knowledge of ${sectionTitle}` : 'Test your knowledge with this quiz'}
      </Typography>
      <Typography variant="body2" style={styles.quizRules} center>
        Answer all questions correctly to earn XP. Any incorrect answer will fail the quiz.
      </Typography>
      <Button
        variant="primary"
        onPress={handleStartQuiz}
        style={styles.actionButton}
      >
        Start Quiz
      </Button>
    </View>
  ), [handleStartQuiz, sectionTitle]);

  const renderQuestion = useCallback(() => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return (
        <View style={styles.errorContainer}>
          <Typography variant="body" style={styles.errorText}>
            No questions available for this quiz.
          </Typography>
          <Button
            variant="primary"
            onPress={handleGoHome}
            style={styles.actionButton}
          >
            Go Back
          </Button>
        </View>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <Card variant="elevated" style={styles.questionCard}>
          <Typography variant="caption" weight="medium" color="secondary">
            QUESTION {currentQuestionIndex + 1} OF {questions.length}
          </Typography>
          <Typography variant="subheading" weight="semiBold" style={styles.questionText}>
            {currentQuestion.question}
          </Typography>
          
          {currentQuestion.options.map((option, index) => (
            <QuizOption 
              key={index} 
              index={index}
              option={option}
              selectedOption={selectedOption}
              onSelect={handleSelectOption}
            />
          ))}
        </Card>
        
        <Button 
          variant="primary"
          onPress={handleNextQuestion}
          disabled={selectedOption === null}
          style={styles.actionButton}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </View>
    );
  }, [currentQuestionIndex, questions, selectedOption, handleGoHome, handleNextQuestion, handleSelectOption]);

  const renderFailedScreen = useCallback(() => (
    <View style={styles.resultContainer}>
      <Image 
        source={require('../../assets/explosion-icon.png')} 
        style={styles.resultIcon}
        resizeMode="contain"
      />
      <Typography variant="heading" weight="bold" style={styles.resultTitle}>
        Oops!
      </Typography>
      <Typography variant="title" style={styles.resultSubtitle}>
        Incorrect Answer
      </Typography>
      <Typography variant="body2" style={styles.resultMessage} center>
        You need to answer all questions correctly to complete the quiz.
      </Typography>
      
      <Button
        variant="primary"
        onPress={handleRetry}
        style={styles.actionButton}
      >
        Try Again
      </Button>
      
      <Button
        variant="secondary"
        onPress={handleGoHome}
        style={styles.actionButton}
      >
        Go Home
      </Button>
    </View>
  ), [handleRetry, handleGoHome]);

  const renderCompletedScreen = useCallback(() => (
    <View style={styles.resultContainer}>
      <Image 
        source={require('../../assets/checkmark-icon.png')} 
        style={styles.resultIcon}
        resizeMode="contain"
      />
      <Typography variant="heading" weight="bold" style={styles.resultTitle}>
        Section Complete!
      </Typography>
      <Typography variant="title" weight="semiBold" color="primary" style={styles.xpText}>
        +{experiencePoints} XP
      </Typography>
      
      <Button
        variant="primary"
        onPress={handleGoHome}
        style={styles.actionButton}
      >
        Continue
      </Button>
    </View>
  ), [experiencePoints, handleGoHome]);

  // Memoize the content rendering function to minimize re-renders
  const renderContent = useCallback(() => {
    if (quizFailed) {
      return renderFailedScreen();
    }
    
    if (quizCompleted) {
      return renderCompletedScreen();
    }
    
    if (!quizStarted) {
      return renderQuizIntro();
    }
    
    return renderQuestion();
  }, [quizFailed, quizCompleted, quizStarted, renderFailedScreen, renderCompletedScreen, renderQuizIntro, renderQuestion]);

  // Memoize the title to prevent title updates from causing re-renders
  const screenTitle = useMemo(() => {
    if (quizStarted && questions.length > 0) {
      return `Question ${currentQuestionIndex + 1}/${questions.length}`;
    }
    return "Quiz Challenge";
  }, [quizStarted, questions.length, currentQuestionIndex]);

  // Use memo for the entire screen render to minimize re-renders
  return useMemo(() => (
    <Screen
      title={screenTitle}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={false}
    >
      {renderContent()}
    </Screen>
  ), [screenTitle, handleBackPress, renderContent]);
};

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: spacing.l,
  },
  quizTimeText: {
    marginBottom: spacing.s,
  },
  quizDescription: {
    marginBottom: spacing.m,
    opacity: 0.8,
  },
  quizRules: {
    marginBottom: spacing.xl,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  actionButton: {
    minWidth: '80%',
    marginVertical: spacing.s,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  questionCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  questionText: {
    marginVertical: spacing.m,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.card,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight + '20', // 20% opacity
    borderColor: colors.primary,
  },
  optionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  selectedCircle: {
    borderColor: colors.primary,
  },
  optionInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  resultIcon: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: spacing.l,
  },
  resultTitle: {
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    marginBottom: spacing.xl,
  },
  resultMessage: {
    marginBottom: spacing.xl,
  },
  xpText: {
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  errorText: {
    marginBottom: spacing.l,
    textAlign: 'center',
  },
});

export default SectionQuiz; 