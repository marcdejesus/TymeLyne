import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const { width, height } = Dimensions.get('window');

const CourseCreateScreen = ({ navigation }) => {
  // State for course creation form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correctOption: 0 }
  ]);

  // Categories
  const categories = [
    { id: 'marketing', name: 'Digital Marketing', icon: require('../../assets/course-icons/marketing.png') },
    { id: 'finance', name: 'Finance', icon: require('../../assets/course-icons/finance.png') },
    { id: 'programming', name: 'Programming', icon: require('../../assets/course-icons/computer.png') },
  ];

  // Handle navigation back to home
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Add a new question to the quiz
  const addQuestion = () => {
    const newQuestion = {
      id: quizQuestions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctOption: 0
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  // Update a question text
  const updateQuestionText = (id, text) => {
    const updatedQuestions = quizQuestions.map(q => 
      q.id === id ? { ...q, question: text } : q
    );
    setQuizQuestions(updatedQuestions);
  };

  // Update an option text
  const updateOptionText = (questionId, optionIndex, text) => {
    const updatedQuestions = quizQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuizQuestions(updatedQuestions);
  };

  // Set correct option
  const setCorrectOption = (questionId, optionIndex) => {
    const updatedQuestions = quizQuestions.map(q => 
      q.id === questionId ? { ...q, correctOption: optionIndex } : q
    );
    setQuizQuestions(updatedQuestions);
  };

  // Handle course creation
  const handleCreateCourse = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a course description');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a course category');
      return;
    }

    // Validate quiz questions
    let isQuizValid = true;
    quizQuestions.forEach((q, index) => {
      if (!q.question.trim()) {
        Alert.alert('Error', `Question ${index + 1} is empty`);
        isQuizValid = false;
        return;
      }
      q.options.forEach((option, i) => {
        if (!option.trim()) {
          Alert.alert('Error', `Option ${i + 1} in Question ${index + 1} is empty`);
          isQuizValid = false;
          return;
        }
      });
    });

    if (!isQuizValid) return;

    // In a real app, send data to API
    // For now, simulate success and navigate back
    Alert.alert(
      'Success',
      'Course created successfully!',
      [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F1E0" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Course</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Course Title Section */}
          <Text style={styles.sectionTitle}>Course Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter course title"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />

          {/* Course Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter course description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          {/* Course Category */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Image source={category.icon} style={styles.categoryIcon} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Practice Quiz */}
          <Text style={styles.sectionTitle}>Practice Quiz</Text>
          {quizQuestions.map((question, questionIndex) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionNumber}>
                {questionIndex + 1}. {`Question ${questionIndex + 1}`}
              </Text>
              <TextInput
                style={styles.questionInput}
                placeholder="Enter your question"
                value={question.question}
                onChangeText={(text) => updateQuestionText(question.id, text)}
              />
              
              {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      question.correctOption === optionIndex && styles.radioButtonSelected
                    ]}
                    onPress={() => setCorrectOption(question.id, optionIndex)}
                  >
                    {question.correctOption === optionIndex && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChangeText={(text) => updateOptionText(question.id, optionIndex, text)}
                  />
                </View>
              ))}
            </View>
          ))}

          {/* Add Question Button */}
          <TouchableOpacity style={styles.addQuestionButton} onPress={addQuestion}>
            <Text style={styles.addQuestionButtonText}>+ Add Question</Text>
          </TouchableOpacity>

          {/* Create Course Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
            <Text style={styles.createButtonText}>Create Course</Text>
          </TouchableOpacity>

          {/* Check Work and Quiz buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.checkWorkButton}>
              <Text style={styles.checkWorkButtonText}>Check Work</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quizButton}>
              <Text style={styles.quizButtonText}>Quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
  },
  backButtonContainer: {
    padding: 5, // Increase touch area
  },
  backButton: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  placeholder: {
    width: 34, // Balance for back button with padding
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40, // Extra padding at the bottom for better scrolling
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: Math.max(100, height * 0.12),
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: width >= 375 ? '30%' : '48%', // Adjust for smaller screens
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    borderColor: '#D35C34',
    borderWidth: 2,
    backgroundColor: '#F4ECE1',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#4A4A3A',
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 8,
  },
  questionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    marginBottom: 8,
    fontSize: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D35C34',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  radioButtonSelected: {
    borderColor: '#D35C34',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D35C34',
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    fontSize: 16,
  },
  addQuestionButton: {
    backgroundColor: '#F4ECE1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D35C34',
    borderStyle: 'dashed',
  },
  addQuestionButtonText: {
    color: '#D35C34',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#D35C34',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  checkWorkButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4A3A',
    flex: 1,
    marginRight: 8,
  },
  checkWorkButtonText: {
    color: '#4A4A3A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quizButton: {
    backgroundColor: '#D35C34',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CourseCreateScreen; 