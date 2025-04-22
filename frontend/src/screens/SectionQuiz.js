import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import Screen from '../components/Screen';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SectionQuiz = ({ navigation, route }) => {
  const { courseId, sectionId, quizType } = route.params;
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizFailed, setQuizFailed] = useState(false);
  const timerRef = useRef(null);
  
  // Mock quiz questions
  const questions = [
    {
      id: 1,
      question: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
      options: [
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.'
      ],
      correctOption: 0
    },
    {
      id: 2,
      question: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
      options: [
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.'
      ],
      correctOption: 1
    },
    {
      id: 3,
      question: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
      options: [
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.'
      ],
      correctOption: 2
    }
  ];

  useEffect(() => {
    if (quizStarted && !quizCompleted && !quizFailed) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setQuizFailed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, quizCompleted, quizFailed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBackPress = () => {
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
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleSelectOption = (index) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = () => {
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
      clearInterval(timerRef.current);
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setQuizFailed(false);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimeRemaining(300);
  };

  const handleGoHome = () => {
    navigation.navigate('CourseDetails', { courseId });
  };

  const renderQuizIntro = () => (
    <View style={styles.introContainer}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.quizTimeText}>Quiz Tyme!</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartQuiz}
      >
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.timerContainer}>
          <Image 
            source={require('../../assets/timer-icon.png')} 
            style={styles.timerIcon}
            resizeMode="contain"
          />
          <Text style={styles.timeRemainingText}>{formatTime(timeRemaining)} REMAINING</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(timeRemaining / 300) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <Text style={styles.questionNumber}>{currentQuestionIndex + 1}.</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.optionContainer,
              selectedOption === index && styles.selectedOption
            ]}
            onPress={() => handleSelectOption(index)}
          >
            <View style={styles.optionCircle}>
              {selectedOption === index && (
                <View style={styles.optionInnerCircle} />
              )}
            </View>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedOption === null && styles.disabledButton
          ]}
          onPress={handleNextQuestion}
          disabled={selectedOption === null}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
      <Text style={styles.failedText}>Oops!</Text>
      <Text style={styles.failedSubtext}>Level Failed</Text>
      
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleGoHome}
      >
        <Text style={styles.homeButtonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedScreen = () => (
    <View style={styles.resultContainer}>
      <Image 
        source={require('../../assets/checkmark-icon.png')} 
        style={styles.resultIcon}
        resizeMode="contain"
      />
      <Text style={styles.completedText}>Section Complete!</Text>
      <Text style={styles.xpText}>+500 XP</Text>
      
      <TouchableOpacity
        style={styles.nextSectionButton}
        onPress={handleGoHome}
      >
        <Text style={styles.nextSectionButtonText}>Next</Text>
      </TouchableOpacity>
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
      title="Quiz"
      onBackPress={handleBackPress}
      backgroundColor="#F9F1E0"
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
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  quizTimeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
  startButtonText: {
    color: colors.textInverted,
    fontSize: 18,
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  timeRemainingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0D8C0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: colors.textTertiary,
    opacity: 0.7,
  },
  nextButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  resultIcon: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  failedText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  failedSubtext: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 40,
  },
  completedText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  xpText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#A0A0A0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '600',
  },
  nextSectionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
  nextSectionButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SectionQuiz; 