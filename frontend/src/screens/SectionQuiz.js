import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import Screen from '../components/Screen';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';
import { updateSectionCompletion, getCourseById } from '../services/courseService';
import { useUserProgression } from '../contexts/UserProgressionContext';

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
  const { courseId, sectionId, sectionTitle, quiz, experiencePoints = 500 } = route.params;
  const { updateProgression } = useUserProgression();
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizFailed, setQuizFailed] = useState(false);
  const [questions, setQuestions] = useState([]);
  const timerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // Initialize quiz questions from the passed quiz data or use mock data if not available
  useEffect(() => {
    console.log('Quiz data received:', quiz);
    
    if (quiz) {
      // Check what ID field is being used
      console.log('Quiz ID fields check:', { 
        hasQuizId: !!quiz.quiz_id, 
        hasUnderscoreId: !!quiz._id,
        quizId: quiz.quiz_id,
        underscoreId: quiz._id
      });
      
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('Using real quiz data with', quiz.questions.length, 'questions');
        console.log('First question ID fields:', {
          hasId: !!quiz.questions[0].id,
          hasUnderscoreId: !!quiz.questions[0]._id,
          id: quiz.questions[0].id,
          underscoreId: quiz.questions[0]._id
        });
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
  
  const loadMockData = () => {
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
        correctOption: 1
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
        correctOption: 2
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
        correctOption: 1
      }
    ]);
  };

  useEffect(() => {
    if (quizStarted && !quizCompleted && !quizFailed) {
      // Use ref to track the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Update timer each second
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setQuizFailed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizStarted, quizCompleted, quizFailed]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
    
    const isCorrect = selectedOption === questions[currentQuestionIndex].correctOption;
    
    if (!isCorrect) {
      // Penalize for wrong answer by reducing time
      setTimeRemaining(prev => Math.max(prev - 30, 0));
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz completed
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setQuizCompleted(true);
      
      // Mark the section as completed
      try {
        updateSectionCompletion(courseId, sectionId, true)
          .then(result => {
            console.log('Section marked as completed:', result);
            
            // Update the progression data in context
            if (result && result.progressData) {
              // Save this in route params to pass back later
              route.params.updatedProgressData = result.progressData;
              
              // Update the global progression context
              updateProgression(result.progressData);
            }
            
            // If we received an updated section, store it too
            if (result && result.section) {
              route.params.updatedSection = result.section;
            }
          })
          .catch(error => {
            console.error('Error updating section completion status:', error);
          });
      } catch (error) {
        console.error('Error updating section completion:', error);
      }
    }
  }, [questions, currentQuestionIndex, selectedOption, courseId, sectionId, route.params, updateProgression]);

  const handleRetry = useCallback(() => {
    setQuizFailed(false);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimeRemaining(300);
  }, []);

  const handleGoHome = useCallback(() => {
    // If we have an updated section, fetch the full course again
    // to ensure we have the latest data with all sections
    try {
      getCourseById(courseId)
        .then(updatedCourseData => {
          console.log('Updated course data after completion:', {
            courseId: updatedCourseData._id || updatedCourseData.course_id,
            totalSections: updatedCourseData.sections?.length,
            completedSections: updatedCourseData.sections?.filter(s => s.isCompleted).length
          });
          
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
          
          if (route.params.updatedProgressData) {
            navigationParams.updatedProgressData = route.params.updatedProgressData;
          }
          
          if (route.params.course) {
            // Use the original course data if available
            navigationParams.courseData = route.params.course;
          }
          
          // Navigate back with whatever data we have
          navigation.navigate('CourseSections', navigationParams);
        });
    } catch (error) {
      console.error('Error in handleGoHome:', error);
      navigation.navigate('CourseSections', { courseId });
    }
  }, [navigation, courseId, route.params]);

  const renderQuizIntro = () => (
    <View style={styles.introContainer}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Typography variant="heading" weight="bold" style={styles.quizTimeText}>
        Quiz Tyme!
      </Typography>
      <Typography variant="body" style={styles.quizDescription} center>
        {sectionTitle ? `Test your knowledge of ${sectionTitle}` : 'Test your knowledge with this quiz'}
      </Typography>
      <Button
        variant="primary"
        onPress={handleStartQuiz}
        style={styles.actionButton}
      >
        Start Quiz
      </Button>
    </View>
  );

  const renderQuestion = () => {
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
        <Card variant="elevated" style={styles.timerCard}>
          <View style={styles.timerContainer}>
            <View style={styles.timerInnerContainer}>
              <Typography variant="caption" weight="semiBold" style={styles.timeRemainingText}>
                {formatTime(timeRemaining)} REMAINING
              </Typography>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.max((timeRemaining / 300) * 100, 0)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </Card>
        
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
  };

  const renderFailedScreen = () => (
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
        Level Failed
      </Typography>
      
      <Button
        variant="primary"
        onPress={handleRetry}
        style={styles.actionButton}
      >
        Retry
      </Button>
      
      <Button
        variant="secondary"
        onPress={handleGoHome}
        style={styles.actionButton}
      >
        Go Home
      </Button>
    </View>
  );

  const renderCompletedScreen = () => (
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
  );

  // Render content based on quiz state
  const renderContent = () => {
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
  };

  return (
    <Screen
      title={quizStarted && questions.length > 0 ? `Question ${currentQuestionIndex + 1}/${questions.length}` : "Quiz"}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={false}
    >
      {renderContent()}
    </Screen>
  );
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
    marginBottom: spacing.xl,
    opacity: 0.8,
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
  timerCard: {
    marginBottom: spacing.m,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerInnerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timeRemainingText: {
    marginBottom: spacing.xs,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.s,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.s,
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