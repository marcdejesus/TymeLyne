import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const ConceptCheckScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { lessonId, title } = route.params || {};
  
  // State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // Sample concept check data - would come from API in real app
  const conceptCheckData = {
    id: 'cc-python-vars',
    title: title || 'Variables and Data Types',
    lessonId: lessonId || 'python-variables',
    questions: [
      {
        id: 'q1',
        type: 'true_false',
        prompt: 'In Python, you must declare a variable type before assigning a value to it.',
        correctAnswer: false,
        explanation: 'Unlike some other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.'
      },
      {
        id: 'q2',
        type: 'fill_blank',
        prompt: 'In Python, to check the type of a variable x, you use the function _____().',
        correctAnswer: 'type',
        explanation: 'The type() function is used to get the type of a variable in Python.'
      },
      {
        id: 'q3',
        type: 'flashcard',
        front: 'What is a "dynamically typed" language?',
        back: 'A dynamically typed language is one where the type of a variable is checked during runtime, not in advance. In Python, you can assign different types to the same variable during the course of a program.',
      },
      {
        id: 'q4',
        type: 'matching',
        prompt: 'Match the data type with the correct Python syntax:',
        options: [
          { id: 'a', text: 'String' },
          { id: 'b', text: 'Integer' },
          { id: 'c', text: 'Float' },
          { id: 'd', text: 'Boolean' },
        ],
        matches: [
          { id: '1', text: '"Hello"' },
          { id: '2', text: '42' },
          { id: '3', text: '3.14159' },
          { id: '4', text: 'True' },
        ],
        correctAnswers: { a: '1', b: '2', c: '3', d: '4' }
      },
    ],
    xpReward: 25
  };
  
  // Calculate progress
  const progress = ((currentQuestion + 1) / conceptCheckData.questions.length) * 100;
  
  // Current question
  const currentQuestionData = conceptCheckData.questions[currentQuestion];
  
  // Handle answer change
  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionData.id]: answer
    });
  };
  
  // Flashcard flip animation
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle flashcard reveal
  useEffect(() => {
    if (currentQuestionData?.type === 'flashcard') {
      // Reset flip when moving to a new flashcard
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  }, [currentQuestion]);
  
  // Slide animation for question transitions
  const slideToNextQuestion = () => {
    // Start animation
    Animated.timing(slideAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After slide out, change question and reset position
      setCurrentQuestion(currentQuestion + 1);
      slideAnimation.setValue(width);
      
      // Slide in new question
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
  
  const slideToPrevQuestion = () => {
    // Start animation
    Animated.timing(slideAnimation, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After slide out, change question and reset position
      setCurrentQuestion(currentQuestion - 1);
      slideAnimation.setValue(-width);
      
      // Slide in new question
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Initialize slide animation when component mounts
  useEffect(() => {
    slideAnimation.setValue(0);
  }, []);
  
  // Check if user can proceed to next question
  const canProceed = () => {
    if (!answers[currentQuestionData.id] && currentQuestionData.type !== 'flashcard') {
      return false;
    }
    return true;
  };
  
  // Handle completion
  const handleComplete = () => {
    setShowFeedback(true);
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < conceptCheckData.questions.length - 1) {
      slideToNextQuestion();
      setCheckAnswers(false);
    } else {
      // Last question, show completion
      handleComplete();
    }
  };
  
  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      slideToPrevQuestion();
      setCheckAnswers(false);
    }
  };
  
  // Check an answer for correctness
  const isCorrect = (questionId) => {
    const question = conceptCheckData.questions.find(q => q.id === questionId);
    const answer = answers[questionId];
    
    if (!question || !answer) return false;
    
    switch (question.type) {
      case 'true_false':
        return answer === question.correctAnswer;
      case 'fill_blank':
        return answer.toLowerCase() === question.correctAnswer.toLowerCase();
      case 'matching':
        // For matching, we'd need to check each pair
        return false; // Simplified for this example
      default:
        return false;
    }
  };
  
  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    conceptCheckData.questions.forEach(question => {
      if (question.type !== 'flashcard' && isCorrect(question.id)) {
        correct++;
      }
    });
    
    // Don't count flashcards in scoring
    const scorableQuestions = conceptCheckData.questions.filter(q => q.type !== 'flashcard').length;
    
    return {
      correct,
      total: scorableQuestions,
      percentage: Math.round((correct / scorableQuestions) * 100)
    };
  };
  
  // Render different question types
  const renderQuestion = () => {
    if (!currentQuestionData) return null;
    
    const frontTransform = {
      transform: [
        { rotateY: flipAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
          })
        }
      ]
    };
    
    const backTransform = {
      transform: [
        { rotateY: flipAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg']
          })
        }
      ]
    };
    
    switch (currentQuestionData.type) {
      case 'true_false':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestionData.prompt}</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[
                  styles.optionButton,
                  answers[currentQuestionData.id] === true && styles.selectedOption,
                  checkAnswers && answers[currentQuestionData.id] === true && !isCorrect(currentQuestionData.id) && styles.wrongOption,
                  checkAnswers && currentQuestionData.correctAnswer === true && styles.correctOption
                ]}
                onPress={() => handleAnswer(true)}
                disabled={checkAnswers}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestionData.id] === true && styles.selectedOptionText
                ]}>True</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.optionButton,
                  answers[currentQuestionData.id] === false && styles.selectedOption,
                  checkAnswers && answers[currentQuestionData.id] === false && !isCorrect(currentQuestionData.id) && styles.wrongOption,
                  checkAnswers && currentQuestionData.correctAnswer === false && styles.correctOption
                ]}
                onPress={() => handleAnswer(false)}
                disabled={checkAnswers}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestionData.id] === false && styles.selectedOptionText
                ]}>False</Text>
              </TouchableOpacity>
            </View>
            
            {checkAnswers && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>
                  {isCorrect(currentQuestionData.id) ? "Correct! ✅" : "Incorrect ❌"}
                </Text>
                <Text style={styles.explanationText}>{currentQuestionData.explanation}</Text>
              </View>
            )}
          </View>
        );
        
      case 'fill_blank':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestionData.prompt}</Text>
            
            <TextInput
              style={[
                styles.fillBlankInput,
                checkAnswers && isCorrect(currentQuestionData.id) && styles.correctInput,
                checkAnswers && !isCorrect(currentQuestionData.id) && styles.wrongInput
              ]}
              placeholder="Your answer..."
              placeholderTextColor="#666666"
              value={answers[currentQuestionData.id] || ''}
              onChangeText={(text) => handleAnswer(text)}
              editable={!checkAnswers}
            />
            
            {checkAnswers && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>
                  {isCorrect(currentQuestionData.id) ? "Correct! ✅" : "Incorrect ❌"}
                </Text>
                <Text style={styles.correctAnswerText}>
                  Correct answer: <Text style={styles.highlightText}>{currentQuestionData.correctAnswer}</Text>
                </Text>
                <Text style={styles.explanationText}>{currentQuestionData.explanation}</Text>
              </View>
            )}
          </View>
        );
        
      case 'flashcard':
        return (
          <View style={styles.questionContainer}>
            <TouchableOpacity 
              style={styles.flashcardContainer} 
              onPress={flipCard}
              activeOpacity={0.9}
            >
              <Animated.View 
                style={[styles.flashcardSide, styles.flashcardFront, frontTransform]}
              >
                <Text style={styles.flashcardText}>{currentQuestionData.front}</Text>
                <Text style={styles.flashcardHint}>Tap to flip</Text>
              </Animated.View>
              
              <Animated.View 
                style={[styles.flashcardSide, styles.flashcardBack, backTransform]}
              >
                <Text style={styles.flashcardText}>{currentQuestionData.back}</Text>
                <Text style={styles.flashcardHint}>Tap to flip back</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        );
        
      case 'matching':
        // Simple implementation of matching for demo
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestionData.prompt}</Text>
            
            <View style={styles.matchingContainer}>
              {currentQuestionData.options.map((option) => (
                <View key={option.id} style={styles.matchingPair}>
                  <Text style={styles.matchingTerm}>{option.text}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                  <View style={styles.matchingDefinitionContainer}>
                    <TextInput
                      style={styles.matchingInput}
                      placeholder="Type matching item..."
                      placeholderTextColor="#666666"
                      value={answers[currentQuestionData.id]?.matches?.[option.id] || ''}
                      onChangeText={(text) => {
                        const currentMatches = answers[currentQuestionData.id]?.matches || {};
                        handleAnswer({
                          matches: {
                            ...currentMatches,
                            [option.id]: text
                          }
                        });
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // Render feedback screen
  const renderFeedback = () => {
    const score = calculateScore();
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.feedbackContainer}>
          <Ionicons 
            name={score.percentage >= 70 ? "checkmark-circle" : "alert-circle"} 
            size={80} 
            color={score.percentage >= 70 ? "#4CAF50" : "#FF9800"} 
            style={styles.feedbackIcon}
          />
          
          <Text style={styles.feedbackTitle}>
            {score.percentage >= 70 ? "Great job!" : "Keep practicing!"}
          </Text>
          
          <Text style={styles.scoreText}>
            You scored {score.correct} out of {score.total} ({score.percentage}%)
          </Text>
          
          <View style={styles.xpContainer}>
            <Ionicons name="trophy" size={24} color={accent} />
            <Text style={styles.xpText}>+{conceptCheckData.xpReward} XP</Text>
          </View>
          
          <View style={styles.feedbackButtons}>
            <TouchableOpacity 
              style={[styles.feedbackButton, { backgroundColor: "#444444" }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.feedbackButtonText}>Back to Lesson</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedbackButton, { backgroundColor: accent }]}
              onPress={() => navigation.navigate('PracticeActivity', {
                lessonId: conceptCheckData.lessonId,
                title: conceptCheckData.title
              })}
            >
              <Text style={styles.feedbackButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  // Show the feedback screen if we're done
  if (showFeedback) {
    return renderFeedback();
  }
  
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
        <Text style={styles.headerTitle}>Concept Check</Text>
        <View style={styles.placeholderRight} />
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
          {currentQuestion + 1} of {conceptCheckData.questions.length}
        </Text>
      </View>
      
      {/* Question content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { transform: [{ translateX: slideAnimation }] }
        ]}
      >
        {renderQuestion()}
      </Animated.View>
      
      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.prevButton,
            currentQuestion === 0 && styles.disabledButton
          ]}
          onPress={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="arrow-back" size={22} color={currentQuestion === 0 ? "#666666" : "#FFFFFF"} />
          <Text style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        
        {!checkAnswers && currentQuestionData.type !== 'flashcard' ? (
          <TouchableOpacity 
            style={[
              styles.navButton, 
              { backgroundColor: accent },
              !canProceed() && styles.disabledButton
            ]}
            onPress={() => setCheckAnswers(true)}
            disabled={!canProceed()}
          >
            <Text style={styles.navButtonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: accent }]}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>
              {currentQuestion === conceptCheckData.questions.length - 1 ? "Finish" : "Next"}
            </Text>
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  selectedOption: {
    borderColor: '#FF9500',
    borderWidth: 2,
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  wrongOption: {
    borderColor: '#F44336',
    borderWidth: 2,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  fillBlankInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  correctInput: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  wrongInput: {
    borderColor: '#F44336',
    borderWidth: 2,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  explanationText: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 24,
  },
  correctAnswerText: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 8,
  },
  highlightText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  flashcardContainer: {
    height: 300,
    marginVertical: 16,
  },
  flashcardSide: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
  },
  flashcardFront: {
    backgroundColor: '#2A2A2A',
  },
  flashcardBack: {
    backgroundColor: '#383838',
  },
  flashcardText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  flashcardHint: {
    position: 'absolute',
    bottom: 16,
    color: '#888888',
    fontSize: 14,
  },
  matchingContainer: {
    marginTop: 16,
  },
  matchingPair: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchingTerm: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchingDefinitionContainer: {
    flex: 1,
  },
  matchingInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
  },
  bottomContainer: {
    flexDirection: 'row',
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
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  disabledText: {
    color: '#666666',
  },
  // Feedback styles
  feedbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  feedbackIcon: {
    marginBottom: 24,
  },
  feedbackTitle: {
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
  feedbackButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  feedbackButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConceptCheckScreen; 