import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Typography from '../components/Typography';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Section Content Screen
 * Displays the content of a specific section in a course
 * 
 * @param {object} navigation - React Navigation object
 * @param {object} route - Route parameters with courseId, sectionId, sectionData, and courseData
 */
const SectionContent = ({ navigation, route }) => {
  const { courseId, sectionId, sectionData, courseData } = route.params;
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  // Mock section content - In a real app, this would come from an API based on sectionId
  const mockSectionContent = {
    id: sectionId,
    title: sectionData?.title || 'Section Content',
    content: [
      courseData?.paragraph1 || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      courseData?.paragraph2 || 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      courseData?.paragraph3 || 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
    ],
    practiceQuiz: [
      {
        id: 1,
        question: 'What is the primary focus of this section?',
        options: [
          'Understanding core concepts',
          'Practical application',
          'Advanced techniques',
          'All of the above'
        ],
        correctOption: 0
      },
      {
        id: 2,
        question: 'Which of the following is NOT discussed in this section?',
        options: [
          'Fundamental principles',
          'Implementation strategies',
          'Quantum physics',
          'Best practices'
        ],
        correctOption: 2
      }
    ],
    isCompleted: sectionData?.isCompleted || false,
    difficulty: courseData?.difficulty || 'Intermediate',
    experiencePoints: Math.floor((courseData?.course_exp || 500) / (courseData?.sections?.length || 1))
  };

  useEffect(() => {
    // Simulate API fetch for section data
    const fetchSectionData = () => {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}/sections/${sectionId}`);
      // const data = await response.json();
      
      setTimeout(() => {
        setSection(mockSectionContent);
        setLoading(false);
      }, 300);
    };

    fetchSectionData();
  }, [courseId, sectionId]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartQuiz = () => {
    navigation.navigate('SectionQuiz', { 
      courseId, 
      sectionId,
      sectionTitle: section.title,
      quizType: 'practice',
      experiencePoints: section.experiencePoints
    });
  };

  const handleCheckWork = () => {
    // In a real app, this would validate user's practice quiz answers
    // and provide feedback
    alert('This would check your practice answers and provide feedback.');
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionIndex]: optionIndex
    });
  };

  if (loading) {
    return (
      <Screen
        title="Loading..."
        onBackPress={handleBackPress}
        backgroundColor={colors.background}
        showBottomNav={false}
      >
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="secondary">
            Loading section content...
          </Typography>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={section.title}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      {/* Section Info Bar */}
      <Card variant="elevated" style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Ionicons name="trophy-outline" size={18} color={colors.primary} />
          <Typography variant="caption" color="secondary" style={styles.infoText}>
            {section.experiencePoints} XP
          </Typography>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
          <Typography variant="caption" color="secondary" style={styles.infoText}>
            {section.difficulty}
          </Typography>
        </View>

        {section.isCompleted && (
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />
            <Typography variant="caption" color={colors.status.success} style={styles.infoText}>
              Completed
            </Typography>
          </View>
        )}
      </Card>
      
      {/* Section Content */}
      <Card variant="elevated" style={styles.contentCard}>
        <Typography variant="title" weight="semiBold" style={styles.contentTitle}>
          {section.title}
        </Typography>
        
        {section.content.map((paragraph, index) => (
          <Typography key={index} variant="body" style={styles.paragraph}>
            {paragraph}
          </Typography>
        ))}
      </Card>
      
      {/* Practice Quiz Section */}
      <Typography variant="title" weight="semiBold" style={styles.practiceQuizTitle}>
        Practice Quiz
      </Typography>
      
      {section.practiceQuiz.map((question, questionIndex) => (
        <Card key={questionIndex} variant="elevated" style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Typography variant="subheading" weight="semiBold" style={styles.questionNumber}>
              Question {questionIndex + 1}
            </Typography>
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          </View>
          
          <Typography variant="body" style={styles.questionText}>
            {question.question}
          </Typography>
          
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedOptions[questionIndex] === optionIndex;
            const isCorrect = isSelected && optionIndex === question.correctOption;
            const isWrong = isSelected && optionIndex !== question.correctOption;
            
            return (
              <TouchableOpacity 
                key={optionIndex} 
                style={[
                  styles.optionContainer,
                  isSelected && styles.selectedOption,
                  isCorrect && styles.correctOption,
                  isWrong && styles.wrongOption
                ]}
                activeOpacity={0.7}
                onPress={() => handleOptionSelect(questionIndex, optionIndex)}
              >
                <View style={[
                  styles.optionCircle,
                  isSelected && styles.selectedCircle,
                  isCorrect && styles.correctCircle,
                  isWrong && styles.wrongCircle
                ]}>
                  {isSelected && (
                    <View style={[
                      styles.optionInnerCircle,
                      isCorrect && styles.correctInnerCircle,
                      isWrong && styles.wrongInnerCircle
                    ]} />
                  )}
                </View>
                <Typography 
                  variant="body2" 
                  style={styles.optionText}
                  color={isCorrect ? "success" : (isWrong ? "error" : "primary")}
                >
                  {option}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </Card>
      ))}
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button 
          variant="secondary"
          style={styles.checkWorkButton}
          onPress={handleCheckWork}
        >
          Check Work
        </Button>
        
        <Button 
          variant="primary"
          style={styles.quizButton}
          onPress={handleStartQuiz}
        >
          Take Quiz
        </Button>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    marginBottom: spacing.m,
    paddingVertical: spacing.s,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.xs,
  },
  contentCard: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  contentTitle: {
    marginBottom: spacing.m,
  },
  paragraph: {
    marginBottom: spacing.m,
    lineHeight: 22,
  },
  practiceQuizTitle: {
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  questionCard: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  questionNumber: {
    color: colors.primary,
  },
  questionText: {
    marginBottom: spacing.m,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.s,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  correctOption: {
    backgroundColor: colors.status.success + '20', // 20% opacity
  },
  wrongOption: {
    backgroundColor: colors.status.error + '20', // 20% opacity
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
  correctCircle: {
    borderColor: colors.status.success,
  },
  wrongCircle: {
    borderColor: colors.status.error,
  },
  optionInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  correctInnerCircle: {
    backgroundColor: colors.status.success,
  },
  wrongInnerCircle: {
    backgroundColor: colors.status.error,
  },
  optionText: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  checkWorkButton: {
    flex: 1,
    marginRight: spacing.xs,
  },
  quizButton: {
    flex: 1,
    marginLeft: spacing.xs,
  },
});

export default SectionContent; 