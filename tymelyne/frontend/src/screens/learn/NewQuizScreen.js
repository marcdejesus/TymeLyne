import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const NewQuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { lessonId, title } = route.params || {};
  
  // State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  
  // Animation
  const fadeAnim = useState(new Animated.Value(1))[0];
  
  // Sample quiz data - would come from API in real app
  const quizData = {
    id: 'quiz-python-vars',
    title: title || 'Python Variables Quiz',
    lessonId: lessonId || 'python-variables',
    description: "Test your knowledge about Python variables and data types.",
    timeLimit: 300, // in seconds (5 minutes)
    passingScore: 70, // percentage
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "Which of the following is the correct way to declare a variable in Python?",
        options: [
          { id: 'a', text: 'var name = "John"' },
          { id: 'b', text: 'name = "John"' },
          { id: 'c', text: 'String name = "John"' },
          { id: 'd', text: 'name := "John"' },
        ],
        correctAnswer: 'b',
        explanation: "In Python, you simply assign a value to a variable using the '=' operator. There's no need to declare the type or use 'var' keyword."
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: "Which of the following is a valid Python boolean value?",
        options: [
          { id: 'a', text: 'true' },
          { id: 'b', text: 'yes' },
          { id: 'c', text: 'True' },
          { id: 'd', text: 'TRUE' },
        ],
        correctAnswer: 'c',
        explanation: "In Python, boolean values are 'True' and 'False', with the first letter capitalized."
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: "What will be the value of x after executing this code?\nx = 5\nx += 3",
        options: [
          { id: 'a', text: '5' },
          { id: 'b', text: '8' },
          { id: 'c', text: '3' },
          { id: 'd', text: '53' },
        ],
        correctAnswer: 'b',
        explanation: "The operator '+=' adds the right operand to the left operand and assigns the result to the left operand. So x += 3 is equivalent to x = x + 3, which gives 8."
      },
      {
        id: 'q4',
        type: 'short_answer',
        question: "What function do you use to check the type of a variable in Python?",
        correctAnswer: "type",
        alternateAnswers: ["type()", "the type function", "type function"],
        caseSensitive: false,
        explanation: "The type() function is used to get the data type of a variable in Python."
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        question: "Which of these is NOT a valid way to create a string in Python?",
        options: [
          { id: 'a', text: 'name = "John"' },
          { id: 'b', text: "name = 'John'" },
          { id: 'c', text: 'name = str("John")' },
          { id: 'd', text: 'name = String("John")' },
        ],
        correctAnswer: 'd',
        explanation: "Python doesn't have a String() constructor like some other languages. The correct ways to create strings are using quotes (single or double) or the str() function."
      },
    ],
    xpReward: {
      base: 50,
      perfect: 25,
      quick: 25,
    }
  };
  
  // Current question
  const currentQuestionData = quizData.questions[currentQuestion];
  
  // Calculate progress
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  
  // Timer setup
  useEffect(() => {
    if (quizData.timeLimit && !timeRemaining) {
      setTimeRemaining(quizData.timeLimit);
      setTimerActive(true);
    }
    
    let timer;
    if (timerActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Time's up, auto-submit
      handleSubmitQuiz();
    }
    
    return () => clearTimeout(timer);
  }, [timeRemaining, timerActive]);
  
  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Handle answer selection
  const handleSelectAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  // Handle short answer input
  const handleShortAnswer = (questionId, text) => {
    setAnswers({
      ...answers,
      [questionId]: text
    });
  };
  
  // Question transition animation
  const animateTransition = (toNext = true) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change question
      if (toNext) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCurrentQuestion(currentQuestion - 1);
      }
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      animateTransition(true);
    } else {
      // Last question, prompt to submit
      Alert.alert(
        "Submit Quiz?",
        "You've reached the end of the quiz. Are you ready to submit?",
        [
          {
            text: "Review Answers",
            style: "cancel"
          },
          { 
            text: "Submit", 
            onPress: handleSubmitQuiz
          }
        ]
      );
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      animateTransition(false);
    }
  };
  
  // Check if an answer is correct
  const isAnswerCorrect = (question, answer) => {
    if (!answer) return false;
    
    switch (question.type) {
      case 'multiple_choice':
        return answer === question.correctAnswer;
        
      case 'short_answer':
        const userAnswer = question.caseSensitive ? answer : answer.toLowerCase();
        const correctAnswer = question.caseSensitive ? question.correctAnswer : question.correctAnswer.toLowerCase();
        
        if (userAnswer === correctAnswer) return true;
        
        // Check alternate answers
        if (question.alternateAnswers) {
          return question.alternateAnswers.some(alt => {
            const altAnswer = question.caseSensitive ? alt : alt.toLowerCase();
            return userAnswer === altAnswer;
          });
        }
        
        return false;
        
      default:
        return false;
    }
  };
  
  // Calculate quiz score
  const calculateScore = () => {
    let correct = 0;
    
    quizData.questions.forEach(question => {
      if (isAnswerCorrect(question, answers[question.id])) {
        correct++;
      }
    });
    
    const percentScore = Math.round((correct / quizData.questions.length) * 100);
    return {
      correct,
      total: quizData.questions.length,
      percentage: percentScore,
      passed: percentScore >= quizData.passingScore
    };
  };
  
  // Calculate XP earned
  const calculateXP = (score) => {
    let totalXP = quizData.xpReward.base;
    
    // Perfect score bonus
    if (score.percentage === 100) {
      totalXP += quizData.xpReward.perfect;
    }
    
    // Quick completion bonus - if more than half the time remains
    if (quizData.timeLimit && timeRemaining > quizData.timeLimit / 2) {
      totalXP += quizData.xpReward.quick;
    }
    
    return totalXP;
  };
  
  // Submit quiz
  const handleSubmitQuiz = () => {
    setTimerActive(false);
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      const score = calculateScore();
      const earnedXP = calculateXP(score);
      
      setQuizScore({
        ...score,
        xp: earnedXP
      });
      
      setShowResults(true);
      setIsSubmitting(false);
    }, 1000);
  };
  
  // Return to course
  const handleFinish = () => {
    // In a real app, this would navigate to the next lesson or back to course overview
    navigation.navigate('CourseProgress', {
      courseId: 'python-101',
      title: 'Python 101'
    });
  };
  
  // Retry quiz
  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setQuizScore(0);
    setTimeRemaining(quizData.timeLimit);
    setTimerActive(true);
  };
  
  // Check if user can proceed (has answered current question)
  const canProceed = () => {
    return !!answers[currentQuestionData?.id];
  };
  
  // Render results screen
  const renderResults = () => {
    const passedImage = 'https://picsum.photos/seed/passed/200/200';
    const failedImage = 'https://picsum.photos/seed/failed/200/200';
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.resultsContainer}>
          <Image 
            source={{ uri: quizScore.passed ? passedImage : failedImage }}
            style={styles.resultImage}
          />
          
          <Text style={styles.resultTitle}>
            {quizScore.passed ? "Congratulations!" : "Keep Learning!"}
          </Text>
          
          <Text style={styles.scoreText}>
            You scored {quizScore.correct} out of {quizScore.total} ({quizScore.percentage}%)
          </Text>
          
          <View style={styles.xpContainer}>
            <Ionicons name="trophy" size={24} color={accent} />
            <Text style={styles.xpText}>+{quizScore.xp} XP</Text>
          </View>
          
          {/* Question review */}
          <Text style={styles.reviewTitle}>Question Review</Text>
          
          {quizData.questions.map((question, index) => (
            <View key={question.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                <Ionicons 
                  name={isAnswerCorrect(question, answers[question.id]) ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={isAnswerCorrect(question, answers[question.id]) ? "#4CAF50" : "#F44336"} 
                />
              </View>
              
              <Text style={styles.reviewQuestion}>{question.question}</Text>
              
              <View style={styles.reviewAnswers}>
                {question.type === 'multiple_choice' ? (
                  <View>
                    <Text style={styles.reviewAnswerLabel}>Your answer:</Text>
                    <Text style={styles.reviewAnswer}>
                      {question.options.find(opt => opt.id === answers[question.id])?.text || 'No answer'}
                    </Text>
                    
                    {!isAnswerCorrect(question, answers[question.id]) && (
                      <>
                        <Text style={styles.reviewCorrectLabel}>Correct answer:</Text>
                        <Text style={styles.reviewCorrectAnswer}>
                          {question.options.find(opt => opt.id === question.correctAnswer)?.text}
                        </Text>
                      </>
                    )}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.reviewAnswerLabel}>Your answer:</Text>
                    <Text style={styles.reviewAnswer}>{answers[question.id] || 'No answer'}</Text>
                    
                    {!isAnswerCorrect(question, answers[question.id]) && (
                      <>
                        <Text style={styles.reviewCorrectLabel}>Correct answer:</Text>
                        <Text style={styles.reviewCorrectAnswer}>{question.correctAnswer}</Text>
                      </>
                    )}
                  </View>
                )}
                
                <Text style={styles.reviewExplanation}>{question.explanation}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.resultButtons}>
            {!quizScore.passed && (
              <TouchableOpacity 
                style={[styles.resultButton, { backgroundColor: '#444444' }]}
                onPress={handleRetry}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.resultButtonText}>Retry Quiz</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.resultButton, { backgroundColor: accent }]}
              onPress={handleFinish}
            >
              <Text style={styles.resultButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  // Show results screen if quiz is completed
  if (showResults) {
    return renderResults();
  }
  
  // Render a multiple choice question
  const renderMultipleChoice = () => {
    return (
      <View style={styles.optionsContainer}>
        {currentQuestionData.options.map(option => (
          <TouchableOpacity 
            key={option.id}
            style={[
              styles.optionButton,
              answers[currentQuestionData.id] === option.id && styles.selectedOption
            ]}
            onPress={() => handleSelectAnswer(currentQuestionData.id, option.id)}
          >
            <Text style={styles.optionLetter}>{option.id.toUpperCase()}</Text>
            <Text style={[
              styles.optionText,
              answers[currentQuestionData.id] === option.id && styles.selectedOptionText
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render a short answer question
  const renderShortAnswer = () => {
    return (
      <View style={styles.shortAnswerContainer}>
        <TextInput
          style={styles.shortAnswerInput}
          placeholder="Type your answer here..."
          placeholderTextColor="#666666"
          value={answers[currentQuestionData.id] || ''}
          onChangeText={(text) => handleShortAnswer(currentQuestionData.id, text)}
          multiline={false}
          autoCapitalize="none"
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              "Exit Quiz?",
              "Your progress will be lost. Are you sure you want to exit?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                { 
                  text: "Exit", 
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quizData.title}</Text>
        
        {timeRemaining !== null && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            <Text style={[
              styles.timerText,
              timeRemaining < 60 && styles.timerWarning
            ]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%`, backgroundColor: accent }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </Text>
      </View>
      
      {/* Question container */}
      <Animated.ScrollView 
        style={[styles.contentScroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.questionText}>{currentQuestionData.question}</Text>
        
        {/* Render different question types */}
        {currentQuestionData.type === 'multiple_choice' && renderMultipleChoice()}
        {currentQuestionData.type === 'short_answer' && renderShortAnswer()}
      </Animated.ScrollView>
      
      {/* Bottom navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.prevButton,
            currentQuestion === 0 && styles.disabledButton
          ]}
          onPress={handlePrevQuestion}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          <Ionicons name="arrow-back" size={22} color={currentQuestion === 0 ? "#666666" : "#FFFFFF"} />
          <Text style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        
        {currentQuestion === quizData.questions.length - 1 ? (
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.submitButton, 
              { backgroundColor: accent },
              (!canProceed() || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleSubmitQuiz}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.navButtonText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.navButtonText}>Submit</Text>
                <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.nextButton, 
              { backgroundColor: accent },
              !canProceed() && styles.disabledButton
            ]}
            onPress={handleNextQuestion}
            disabled={!canProceed() || isSubmitting}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  timerWarning: {
    color: '#FF5722',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2A2A2A',
    marginTop: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#444444',
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#BBBBBB',
    fontSize: 12,
    marginLeft: 4,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444444',
  },
  selectedOption: {
    borderColor: '#FF9500',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444444',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
    fontWeight: 'bold',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  shortAnswerContainer: {
    marginTop: 16,
  },
  shortAnswerInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  bottomContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    padding: 16,
    paddingBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  prevButton: {
    backgroundColor: '#444444',
  },
  nextButton: {
    backgroundColor: '#FF9500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  disabledText: {
    color: '#666666',
  },
  // Results styles
  resultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 18,
    color: '#DDDDDD',
    marginBottom: 24,
    textAlign: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 32,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  reviewItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewQuestionNumber: {
    color: '#BBBBBB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewQuestion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 22,
  },
  reviewAnswers: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
  },
  reviewAnswerLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 4,
  },
  reviewAnswer: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  reviewCorrectLabel: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 4,
  },
  reviewCorrectAnswer: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewExplanation: {
    color: '#DDDDDD',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 50,
    width: '100%',
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    flex: 1,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 6,
  },
});

export default NewQuizScreen; 