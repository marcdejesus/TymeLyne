import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * QuizActivityScreen - Interactive quiz with multiple choice questions
 */
const QuizActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get module data from navigation params
  const { activityId, activityTitle } = route.params || {};
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // States for quiz progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // Animation value for progress bar
  const [progressAnim] = useState(new Animated.Value(0));
  
  // Sample quiz data (in a real app, this would come from an API)
  const quizData = {
    title: activityTitle || "Python Basics Quiz",
    questions: [
      {
        question: "What is Python?",
        options: [
          "A type of snake",
          "A high-level programming language",
          "A database management system",
          "A web browser"
        ],
        correctAnswer: 1,
        explanation: "Python is a high-level, general-purpose programming language that emphasizes code readability."
      },
      {
        question: "Which of the following is NOT a Python data type?",
        options: [
          "int",
          "float",
          "char",
          "list"
        ],
        correctAnswer: 2,
        explanation: "Python doesn't have a 'char' type. It uses 'str' for both single characters and strings."
      },
      {
        question: "How do you create a comment in Python?",
        options: [
          "// This is a comment",
          "/* This is a comment */",
          "# This is a comment",
          "<!-- This is a comment -->"
        ],
        correctAnswer: 2,
        explanation: "In Python, comments start with the '#' symbol and extend to the end of the line."
      },
      {
        question: "What will print(2 ** 3) output in Python?",
        options: [
          "6",
          "8",
          "5",
          "Error"
        ],
        correctAnswer: 1,
        explanation: "The '**' operator in Python is for exponentiation. 2 ** 3 = 2³ = 8."
      },
      {
        question: "Which method is used to add an element at the end of a list in Python?",
        options: [
          "list.add()",
          "list.append()",
          "list.insert()",
          "list.extend()"
        ],
        correctAnswer: 1,
        explanation: "list.append(element) adds a single element to the end of a list."
      }
    ]
  };
  
  // Current question being displayed
  const currentQuestion = quizData.questions[currentQuestionIndex];
  
  // Handle progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / quizData.questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);
  
  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || showResult) return; // Prevent multiple selections
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    // Update score if correct
    if (answerIndex === currentQuestion.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };
  
  // Move to next question or complete quiz
  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };
  
  // Render the result screen
  const renderResultScreen = () => {
    const score = (correctAnswers / quizData.questions.length) * 100;
    let resultMessage = "You need more practice!";
    
    if (score >= 80) {
      resultMessage = "Excellent! You're a pro!";
    } else if (score >= 60) {
      resultMessage = "Good job! Keep learning!";
    }
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Quiz Completed!</Text>
        <View style={[styles.scoreCircle, { borderColor: accentColor }]}>
          <Text style={[styles.scoreText, { color: accentColor }]}>
            {Math.round(score)}%
          </Text>
        </View>
        <Text style={styles.resultMessage}>{resultMessage}</Text>
        <Text style={styles.scoreDetails}>
          You got {correctAnswers} out of {quizData.questions.length} questions correct.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: accentColor }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Return to Module</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.retryButton]}
          onPress={() => {
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setCorrectAnswers(0);
            setQuizCompleted(false);
            setShowResult(false);
          }}
        >
          <Text style={styles.buttonText}>Retry Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render the question screen
  const renderQuestionScreen = () => {
    return (
      <View style={styles.questionContainer}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: accentColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }) 
              }
            ]} 
          />
        </View>
        
        {/* Question counter */}
        <Text style={styles.counter}>
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </Text>
        
        {/* Question */}
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {/* Answer options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            
            let optionStyle = styles.option;
            if (showResult) {
              if (isCorrect) {
                optionStyle = [styles.option, styles.correctOption];
              } else if (isSelected && !isCorrect) {
                optionStyle = [styles.option, styles.incorrectOption];
              }
            } else if (isSelected) {
              optionStyle = [styles.option, { borderColor: accentColor }];
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.optionText}>{option}</Text>
                
                {showResult && isCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.resultIcon} />
                )}
                
                {showResult && isSelected && !isCorrect && (
                  <Ionicons name="close-circle" size={24} color="#F44336" style={styles.resultIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Explanation */}
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
        
        {/* Next button */}
        {showResult && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="help-circle" size={24} color={accentColor} />
          <Text style={styles.headerTitle}>Quiz</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {quizCompleted ? renderResultScreen() : renderQuestionScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginVertical: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  counter: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  resultIcon: {
    marginLeft: 10,
  },
  explanationContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  explanationTitle: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  explanationText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  resultMessage: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreDetails: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#555',
  },
});

export default QuizActivityScreen; 