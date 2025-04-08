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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const ChallengeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { lessonId, title, courseId } = route.params || {};
  
  // State
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(90); // 90 seconds per challenge
  const [timerActive, setTimerActive] = useState(true);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  // Animation values
  const pulseAnim = useState(new Animated.Value(1))[0];
  const streakAnim = useState(new Animated.Value(1))[0];
  const timerAnim = useState(new Animated.Value(0))[0];
  
  // Sample challenge data - would come from API in real app
  const challengeData = {
    id: 'challenge-python-advanced',
    title: title || 'Python Advanced Challenges',
    lessonId: lessonId || 'python-variables',
    courseId: courseId || 'python-101',
    description: "Test your Python knowledge with these challenging problems. Solve them all to earn bonus XP!",
    challenges: [
      {
        id: 'c1',
        difficulty: 'medium',
        question: "Write a single line of Python code that swaps the values of variables 'a' and 'b' without using a temporary variable.",
        expectedOutput: null,
        hints: [
          "Think about using tuple unpacking",
          "Python allows multiple assignment in one line"
        ],
        solutions: [
          "a, b = b, a"
        ],
        points: 100,
        validationFunction: (code) => {
          // In a real app, this would execute and test the code
          return code.includes('a, b = b, a') || 
                 code.includes('b, a = a, b') ||
                 code.includes('[a, b] = [b, a]');
        }
      },
      {
        id: 'c2',
        difficulty: 'medium',
        question: "Write a Python one-liner that creates a list of the squares of numbers from 1 to 10 (inclusive) that are divisible by 2.",
        expectedOutput: "[4, 16, 36, 64, 100]",
        hints: [
          "Use a list comprehension",
          "First filter numbers divisible by 2, then square them"
        ],
        solutions: [
          "[x**2 for x in range(1, 11) if x % 2 == 0]"
        ],
        points: 150,
        validationFunction: (code) => {
          return code.includes('[') && 
                 code.includes('**2') && 
                 code.includes('range') && 
                 code.includes('if') && 
                 code.includes('%');
        }
      },
      {
        id: 'c3',
        difficulty: 'hard',
        question: "Write a single line of Python code that flattens a list of lists. Example: Convert [[1,2], [3,4], [5,6]] to [1,2,3,4,5,6]",
        expectedOutput: "[1, 2, 3, 4, 5, 6]",
        hints: [
          "Use list comprehension with a nested loop",
          "Consider using the 'sum' function with an appropriate second argument"
        ],
        solutions: [
          "[item for sublist in nested_list for item in sublist]",
          "sum(nested_list, [])"
        ],
        points: 200,
        validationFunction: (code) => {
          return (code.includes('[') && 
                  code.includes('for') && 
                  code.includes('in') && 
                  code.includes('for')) || 
                 (code.includes('sum(') && 
                  code.includes('[]'));
        }
      }
    ],
    streakBonus: {
      2: 50,  // 50 bonus points for 2 consecutive correct answers
      3: 150  // 150 bonus points for 3 consecutive correct answers
    },
    timeBonusFactor: 1.5 // if completed in half the allowed time, multiply points by this
  };
  
  // Current challenge
  const currentChallengeData = challengeData.challenges[currentChallenge];
  
  // Timer
  useEffect(() => {
    let interval;
    
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      // Time's up
      handleSubmit(true);
    }
    
    // Animate timer bar
    timerAnim.setValue(timer / 90); // Proportion of time remaining
    
    // Pulse animation when time is running low
    if (timer <= 15 && timerActive) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    }
    
    return () => clearInterval(interval);
  }, [timer, timerActive]);
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle hint reveal
  const showHint = () => {
    if (!currentChallengeData.hints || currentChallengeData.hints.length === 0) {
      Alert.alert("No Hints", "No hints available for this challenge.");
      return;
    }
    
    Alert.alert(
      "Hint",
      currentChallengeData.hints[0],
      [
        { text: "OK" }
      ]
    );
  };
  
  // Handle submit
  const handleSubmit = (isTimeout = false) => {
    setTimerActive(false);
    
    if (isTimeout) {
      // Handle timeout
      setResult({
        correct: false,
        message: "Time's up! Let's see the solution.",
        solution: currentChallengeData.solutions[0],
        points: 0
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would validate on the server
    setTimeout(() => {
      const isCorrect = currentChallengeData.validationFunction(userAnswer);
      let points = 0;
      let timeBonus = 0;
      
      if (isCorrect) {
        // Calculate points
        points = currentChallengeData.points;
        
        // Add time bonus if more than half the time is left
        if (timer > 45) {
          timeBonus = Math.floor(points * (challengeData.timeBonusFactor - 1));
          points += timeBonus;
        }
        
        // Update streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        
        // Add streak bonus if applicable
        if (challengeData.streakBonus[newStreak]) {
          points += challengeData.streakBonus[newStreak];
          
          // Animate streak
          Animated.sequence([
            Animated.timing(streakAnim, {
              toValue: 1.5,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.spring(streakAnim, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true
            })
          ]).start();
        }
        
        setTotalScore(prev => prev + points);
      } else {
        // Reset streak on wrong answer
        setStreak(0);
      }
      
      setResult({
        correct: isCorrect,
        message: isCorrect 
          ? "Great job! Your solution works!" 
          : "That's not quite right. Let's see the solution.",
        solution: currentChallengeData.solutions[0],
        points: points,
        timeBonus: timeBonus > 0 ? timeBonus : null,
        streakBonus: isCorrect && challengeData.streakBonus[streak + 1] 
          ? challengeData.streakBonus[streak + 1] 
          : null
      });
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  // Handle next challenge or completion
  const handleNext = () => {
    if (currentChallenge < challengeData.challenges.length - 1) {
      // Move to next challenge
      setCurrentChallenge(currentChallenge + 1);
      setUserAnswer('');
      setResult(null);
      setTimer(90);
      setTimerActive(true);
    } else {
      // All challenges completed
      setChallengeCompleted(true);
    }
  };
  
  // Render results and solution
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <View style={styles.resultContainer}>
        <View style={[
          styles.resultHeader, 
          { backgroundColor: result.correct ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
        ]}>
          <Ionicons 
            name={result.correct ? "checkmark-circle" : "close-circle"} 
            size={24} 
            color={result.correct ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.resultMessage}>{result.message}</Text>
        </View>
        
        {result.points > 0 && (
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Points earned:</Text>
            <Text style={styles.pointsValue}>+{result.points}</Text>
            
            {result.timeBonus && (
              <View style={styles.bonusItem}>
                <Ionicons name="time-outline" size={16} color={accent} />
                <Text style={styles.bonusText}>Speed bonus: +{result.timeBonus}</Text>
              </View>
            )}
            
            {result.streakBonus && (
              <Animated.View 
                style={[
                  styles.bonusItem,
                  { transform: [{ scale: streakAnim }] }
                ]}
              >
                <Ionicons name="flame" size={16} color="#FF5722" />
                <Text style={styles.bonusText}>Streak bonus: +{result.streakBonus}</Text>
              </Animated.View>
            )}
          </View>
        )}
        
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionLabel}>Solution:</Text>
          <View style={styles.solutionCode}>
            <Text style={styles.solutionText}>{result.solution}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: accent }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentChallenge < challengeData.challenges.length - 1
              ? "Next Challenge"
              : "Complete Challenges"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render completion screen
  const renderCompletionScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.completionContainer}>
          <Ionicons 
            name="trophy" 
            size={80} 
            color="#FFD700" 
            style={styles.completionIcon}
          />
          
          <Text style={styles.completionTitle}>Challenge Complete!</Text>
          
          <Text style={styles.completionText}>
            You've conquered the advanced challenges and earned:
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.totalScore}>{totalScore}</Text>
            <Text style={styles.pointsLabel}>POINTS</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="flag-outline" size={22} color={accent} />
              <Text style={styles.statValue}>{challengeData.challenges.length}</Text>
              <Text style={styles.statLabel}>Challenges</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={22} color="#FF5722" />
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={22} color="#FFD700" />
              <Text style={styles.statValue}>
                {challengeData.challenges.filter((_, i) => 
                  i < currentChallenge && result?.correct).length}
              </Text>
              <Text style={styles.statLabel}>Perfect</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.finishButton, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('CourseProgress', {
              courseId: challengeData.courseId,
              title: 'Course Progress'
            })}
          >
            <Text style={styles.finishButtonText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  
  // Show completion screen if all challenges are done
  if (challengeCompleted) {
    return renderCompletionScreen();
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (!result) {
              Alert.alert(
                "Exit Challenge?",
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
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bonus Challenge</Text>
        
        {streak > 0 && (
          <Animated.View 
            style={[
              styles.streakContainer,
              { transform: [{ scale: streakAnim }] }
            ]}
          >
            <Ionicons name="flame" size={18} color="#FFFFFF" />
            <Text style={styles.streakText}>{streak}</Text>
          </Animated.View>
        )}
      </View>
      
      {/* Challenge progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Challenge {currentChallenge + 1} of {challengeData.challenges.length}
        </Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {currentChallengeData.difficulty}
          </Text>
        </View>
      </View>
      
      {/* Timer */}
      <Animated.View 
        style={[
          styles.timerContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.timerBar}>
          <Animated.View 
            style={[
              styles.timerFill,
              { 
                width: timerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: timerAnim.interpolate({
                  inputRange: [0, 0.3, 0.6, 1],
                  outputRange: ['#F44336', '#FF9800', '#4CAF50', '#4CAF50']
                }) 
              }
            ]}
          />
        </View>
        <View style={styles.timerTextContainer}>
          <Ionicons 
            name="time-outline" 
            size={18} 
            color={timer <= 15 ? "#F44336" : "#FFFFFF"} 
          />
          <Text 
            style={[
              styles.timerText,
              timer <= 15 && styles.timerWarning
            ]}
          >
            {formatTime(timer)}
          </Text>
        </View>
      </Animated.View>
      
      {/* Challenge content */}
      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.questionText}>{currentChallengeData.question}</Text>
        
        {currentChallengeData.expectedOutput && (
          <View style={styles.expectedOutputContainer}>
            <Text style={styles.expectedOutputLabel}>Expected Output:</Text>
            <Text style={styles.expectedOutputText}>{currentChallengeData.expectedOutput}</Text>
          </View>
        )}
        
        {!result && (
          <View style={styles.answerContainer}>
            <View style={styles.answerHeaderRow}>
              <Text style={styles.answerLabel}>Your Solution:</Text>
              <TouchableOpacity 
                style={styles.hintButton}
                onPress={showHint}
              >
                <Ionicons name="bulb-outline" size={18} color={accent} />
                <Text style={[styles.hintText, { color: accent }]}>Hint</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.codeInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              placeholder="Write your solution here..."
              placeholderTextColor="#777777"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!result && !isSubmitting}
            />
          </View>
        )}
        
        {renderResult()}
      </ScrollView>
      
      {/* Submit button (only shown before submission) */}
      {!result && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { backgroundColor: accent },
              (!userAnswer.trim() || isSubmitting) && styles.disabledButton
            ]}
            onPress={() => handleSubmit()}
            disabled={!userAnswer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Checking...</Text>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Solution</Text>
                <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2A2A2A',
    marginTop: 1,
  },
  progressText: {
    color: '#DDDDDD',
    fontSize: 14,
  },
  difficultyBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  timerContainer: {
    padding: 12,
    backgroundColor: '#2A2A2A',
    marginTop: 1,
  },
  timerBar: {
    height: 6,
    backgroundColor: '#444444',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#F44336',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 20,
  },
  expectedOutputContainer: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  expectedOutputLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 6,
  },
  expectedOutputText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  answerContainer: {
    marginTop: 16,
  },
  answerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    marginLeft: 4,
    fontSize: 14,
  },
  codeInput: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    height: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444444',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 30,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  resultContainer: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  resultMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  pointsContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  pointsLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bonusText: {
    color: '#DDDDDD',
    fontSize: 14,
    marginLeft: 6,
  },
  solutionContainer: {
    padding: 16,
    backgroundColor: '#333333',
  },
  solutionLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 8,
  },
  solutionCode: {
    backgroundColor: '#222222',
    padding: 12,
    borderRadius: 6,
  },
  solutionText: {
    color: '#4CAF50',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 6,
  },
  // Completion styles
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  completionIcon: {
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 18,
    color: '#DDDDDD',
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statLabel: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  finishButton: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ChallengeScreen; 