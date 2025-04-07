import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * QuizActivityScreen - Interactive quiz with multiple choice questions
 */
const QuizActivityScreen = ({ route }) => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const { activity, moduleId } = route.params;
  
  // State variables
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(Array(activity.content.questions.length).fill(null));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Get current question data
  const questionData = activity.content.questions[currentQuestion];
  
  // Check if all questions are answered
  const allAnswered = selectedOptions.every(option => option !== null);
  
  // Handle option selection
  const handleSelectOption = (optionIndex) => {
    if (quizCompleted) return;
    
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestion] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };
  
  // Calculate results when quiz is completed
  const calculateResults = () => {
    let correctCount = 0;
    activity.content.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / activity.content.questions.length) * 100);
    setScore(finalScore);
  };
  
  // Handle completing the quiz
  const handleComplete = () => {
    calculateResults();
    setQuizCompleted(true);
  };
  
  // Handle navigating to next question
  const handleNextQuestion = () => {
    // Animate transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
      
      // Animate back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Handle checking the answer
  const handleCheckAnswer = () => {
    setShowFeedback(true);
  };
  
  // Handle finishing the quiz
  const handleFinish = () => {
    // In a real app, you would save this to your backend/state management
    navigation.goBack();
  };
  
  // Is the current selected option correct
  const isCurrentSelectionCorrect = () => {
    return selectedOptions[currentQuestion] === questionData.correctAnswer;
  };
  
  // Render options
  const renderOptions = () => {
    return questionData.options.map((option, index) => {
      const isSelected = selectedOptions[currentQuestion] === index;
      const isCorrect = index === questionData.correctAnswer;
      
      // Determine option style based on selection and feedback state
      let optionStyle = [styles.option];
      let textStyle = [styles.optionText];
      
      if (isSelected) {
        optionStyle.push(styles.selectedOption);
        optionStyle.push({ borderColor: accent });
        textStyle.push({ color: accent });
      }
      
      if (showFeedback) {
        if (isCorrect) {
          optionStyle.push(styles.correctOption);
          optionStyle.push({ borderColor: '#4CAF50' });
          textStyle.push({ color: '#4CAF50' });
        } else if (isSelected && !isCorrect) {
          optionStyle.push(styles.incorrectOption);
          optionStyle.push({ borderColor: '#F44336' });
          textStyle.push({ color: '#F44336' });
        }
      }
      
      return (
        <TouchableOpacity 
          key={index}
          style={optionStyle}
          onPress={() => handleSelectOption(index)}
          disabled={showFeedback}
        >
          <Text style={textStyle}>{option}</Text>
          
          {showFeedback && isCorrect && (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.feedbackIcon} />
          )}
          
          {showFeedback && isSelected && !isCorrect && (
            <Ionicons name="close-circle" size={24} color="#F44336" style={styles.feedbackIcon} />
          )}
        </TouchableOpacity>
      );
    });
  };
  
  // Render question content
  const renderQuestionContent = () => {
    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressIndicator}>
          {activity.content.questions.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot, 
                currentQuestion === index && { backgroundColor: accent },
                selectedOptions[index] !== null && { backgroundColor: '#666' }
              ]} 
            />
          ))}
        </View>
        
        <Text style={styles.questionNumber}>
          Question {currentQuestion + 1} of {activity.content.questions.length}
        </Text>
        <Text style={styles.questionText}>{questionData.question}</Text>
        
        <View style={styles.optionsContainer}>
          {renderOptions()}
        </View>
        
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText, 
              isCurrentSelectionCorrect() ? styles.correctFeedbackText : styles.incorrectFeedbackText
            ]}>
              {isCurrentSelectionCorrect() 
                ? 'Correct!' 
                : `Incorrect. The correct answer is: ${questionData.options[questionData.correctAnswer]}`}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };
  
  // Render results
  const renderResults = () => {
    const isHighScore = score >= 80;
    const isMediumScore = score >= 60 && score < 80;
    
    return (
      <View style={styles.resultsContainer}>
        <View style={[styles.scoreCircle, { borderColor: accent }]}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
        
        <Text style={styles.resultTitle}>
          {isHighScore ? 'Great job!' : isMediumScore ? 'Good effort!' : 'Keep practicing!'}
        </Text>
        
        <Text style={styles.resultDescription}>
          You answered {activity.content.questions.filter((q, i) => 
            selectedOptions[i] === q.correctAnswer
          ).length} out of {activity.content.questions.length} questions correctly.
        </Text>
      </View>
    );
  };
  
  // Render bottom button
  const renderBottomButton = () => {
    if (quizCompleted) {
      return (
        <TouchableOpacity 
          style={[styles.bottomButton, { backgroundColor: accent }]}
          onPress={handleFinish}
        >
          <Text style={styles.bottomButtonText}>Finish</Text>
        </TouchableOpacity>
      );
    }
    
    if (showFeedback) {
      if (currentQuestion < activity.content.questions.length - 1) {
        return (
          <TouchableOpacity 
            style={[styles.bottomButton, { backgroundColor: accent }]}
            onPress={handleNextQuestion}
          >
            <Text style={styles.bottomButtonText}>Next Question</Text>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity 
            style={[styles.bottomButton, { backgroundColor: accent }]}
            onPress={handleComplete}
          >
            <Text style={styles.bottomButtonText}>See Results</Text>
          </TouchableOpacity>
        );
      }
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.bottomButton, 
          { backgroundColor: accent },
          selectedOptions[currentQuestion] === null && styles.disabledButton
        ]}
        onPress={handleCheckAnswer}
        disabled={selectedOptions[currentQuestion] === null}
      >
        <Text style={styles.bottomButtonText}>Check Answer</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activity.title}</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!quizCompleted ? renderQuestionContent() : renderResults()}
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {renderBottomButton()}
      </View>
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
  placeholderRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  questionContainer: {
    flex: 1,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#444',
    marginHorizontal: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#EEEEEE',
    flex: 1,
  },
  feedbackIcon: {
    marginLeft: 10,
  },
  feedbackContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  feedbackText: {
    fontSize: 16,
  },
  correctFeedbackText: {
    color: '#4CAF50',
  },
  incorrectFeedbackText: {
    color: '#F44336',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default QuizActivityScreen; 