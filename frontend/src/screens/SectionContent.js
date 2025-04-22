import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

const SectionContent = ({ navigation, route }) => {
  const { courseId, sectionId } = route.params;
  
  // Mock section content
  const sectionContent = {
    title: 'Section Title',
    paragraphs: [
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.',
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.',
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.'
    ],
    practiceQuiz: [
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
    ]
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartQuiz = () => {
    navigation.navigate('SectionQuiz', { 
      courseId, 
      sectionId,
      quizType: 'practice'
    });
  };

  return (
    <Screen
      title={sectionContent.title}
      onBackPress={handleBackPress}
      backgroundColor="#F9F1E0"
      showBottomNav={false}
      scrollable={true}
    >
      {/* Section paragraphs */}
      <Text style={styles.sectionTitle}>Section Title</Text>
      
      {sectionContent.paragraphs.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
      
      {/* Practice Quiz Section */}
      <Text style={styles.practiceQuizTitle}>Practice Quiz</Text>
      
      {sectionContent.practiceQuiz.map((question, index) => (
        <Card key={index} style={styles.questionCard}>
          <Text style={styles.questionNumber}>{index + 1}.</Text>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.options.map((option, optionIndex) => (
            <TouchableOpacity 
              key={optionIndex} 
              style={styles.optionContainer}
            >
              <View style={styles.optionCircle}>
                {optionIndex === question.correctOption && (
                  <View style={styles.optionInnerCircle} />
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      ))}
      
      {/* Quiz button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.checkWorkButton}
          onPress={() => {}}
        >
          <Text style={styles.checkWorkButtonText}>Check Work</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quizButton}
          onPress={handleStartQuiz}
        >
          <Text style={styles.quizButtonText}>Quiz</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  practiceQuizTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  questionCard: {
    marginBottom: 16,
    backgroundColor: "#F9F1E0",
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: colors.text,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  checkWorkButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkWorkButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  quizButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  quizButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SectionContent; 