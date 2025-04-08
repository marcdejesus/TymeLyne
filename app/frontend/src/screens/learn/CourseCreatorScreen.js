import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { generateCourse } from '../../services/courseGenerator';
import { saveGeneratedCourse } from '../../services/courseStorage';

const CourseCreatorScreen = () => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const scrollViewRef = useRef(null);

  // State for the form
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    goal: '',
    useCase: '',
    hasPriorExperience: false,
    skillLevel: 'Beginner',
    existingKnowledge: '',
    learningStyle: 'mixed',
    enjoysGamification: true,
    wantsProjects: true,
    daysPerWeek: 3,
    timePerDay: '10-20 min',
    timeCommitment: 'medium',
    interests: '',
    contentTheme: 'general',
    advancedPath: 'linear',
  });

  // Form steps
  const formSteps = [
    {
      title: "Topic & Goal",
      description: "Let's define what you want to learn",
      fields: [
        { 
          key: 'topic', 
          label: 'What subject or skill do you want to learn?', 
          type: 'text',
          placeholder: 'e.g. Python, French, Photography...' 
        },
        { 
          key: 'goal', 
          label: "What's your end goal with this course?", 
          type: 'text',
          placeholder: 'e.g. Build a simple app, hold a conversation...' 
        },
        { 
          key: 'useCase', 
          label: "Is there a specific use-case you're preparing for?", 
          type: 'text',
          placeholder: 'e.g. travel, job, hobby project...' 
        },
      ]
    },
    {
      title: "Experience Level",
      description: "Tell us about your current knowledge",
      fields: [
        { 
          key: 'hasPriorExperience', 
          label: 'Have you studied this topic before?', 
          type: 'boolean',
        },
        { 
          key: 'skillLevel', 
          label: 'How would you rate your current level?', 
          type: 'select',
          options: ['Beginner', 'Intermediate', 'Advanced']
        },
        { 
          key: 'existingKnowledge', 
          label: 'What do you already know about this topic? (optional)', 
          type: 'text',
          multiline: true,
          placeholder: 'Describe any prior experience or knowledge...' 
        },
      ]
    },
    {
      title: "Learning Preferences",
      description: "How do you prefer to learn?",
      fields: [
        { 
          key: 'learningStyle', 
          label: 'What type of content do you prefer?', 
          type: 'select',
          options: ['Reading', 'Interactive', 'Quizzes', 'Mixed']
        },
        { 
          key: 'enjoysGamification', 
          label: 'Do you enjoy games and rewards while learning?', 
          type: 'boolean',
        },
        { 
          key: 'wantsProjects', 
          label: 'Would you like real-world projects included?', 
          type: 'boolean',
        },
      ]
    },
    {
      title: "Time Commitment",
      description: "How much time can you dedicate?",
      fields: [
        { 
          key: 'daysPerWeek', 
          label: 'How many days per week can you practice?', 
          type: 'number',
          min: 1,
          max: 7
        },
        { 
          key: 'timePerDay', 
          label: 'How much time per day?', 
          type: 'select',
          options: ['5-10 min', '10-20 min', '30+ min']
        },
        { 
          key: 'timeCommitment', 
          label: 'What is your overall time commitment?', 
          type: 'select',
          options: [
            { value: 'short', label: 'Short (1-2 weeks)' }, 
            { value: 'medium', label: 'Medium (1-2 months)' }, 
            { value: 'long', label: 'Long term (ongoing)' }
          ]
        },
      ]
    },
    {
      title: "Personalization",
      description: "Let's make your course uniquely yours",
      fields: [
        { 
          key: 'interests', 
          label: 'What are your interests or hobbies?', 
          type: 'text',
          placeholder: 'e.g. sports, movies, tech, cooking...' 
        },
        { 
          key: 'contentTheme', 
          label: 'Theme for examples and content:', 
          type: 'select',
          options: [
            { value: 'general', label: 'General' },
            { value: 'tech', label: 'Technology' }, 
            { value: 'business', label: 'Business' }, 
            { value: 'creative', label: 'Creative Arts' },
            { value: 'scienceNature', label: 'Science & Nature' }
          ]
        },
        { 
          key: 'advancedPath', 
          label: 'Advanced: Preferred learning path', 
          type: 'select',
          options: [
            { value: 'linear', label: 'Linear (structured)' }, 
            { value: 'challenge', label: 'Challenge-based' }, 
            { value: 'adaptive', label: 'Adaptive (based on performance)' }
          ]
        },
      ]
    }
  ];

  // Handle input changes
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.topic.trim()) {
        Alert.alert("Missing Information", "Please enter a topic for your course");
        setIsLoading(false);
        return;
      }
      
      if (!formData.goal.trim()) {
        Alert.alert("Missing Information", "Please enter your learning goal");
        setIsLoading(false);
        return;
      }
      
      // Generate the course using our service
      const course = await generateCourse(formData);
      
      // Save the generated course
      await saveGeneratedCourse(course);
      
      // Navigate to the course overview
      navigation.navigate('CourseOverview', { 
        courseId: course.id,
        title: course.title
      });
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert(
        "Error Creating Course", 
        "There was a problem generating your course. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render form field based on type
  const renderField = (field) => {
    switch(field.type) {
      case 'text':
        return (
          <TextInput
            style={[styles.input, field.multiline && styles.multilineInput]}
            placeholder={field.placeholder || `Enter ${field.label}`}
            placeholderTextColor="#777"
            value={formData[field.key]}
            onChangeText={(text) => handleInputChange(field.key, text)}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
          />
        );
      
      case 'select':
        return (
          <View style={styles.selectContainer}>
            {field.options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.selectOption,
                    formData[field.key] === optionValue && { backgroundColor: accent, borderColor: accent }
                  ]}
                  onPress={() => handleInputChange(field.key, optionValue)}
                >
                  <Text style={[
                    styles.selectOptionText,
                    formData[field.key] === optionValue && { color: '#fff' }
                  ]}>
                    {optionLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      
      case 'boolean':
        return (
          <View style={styles.booleanContainer}>
            <TouchableOpacity
              style={[
                styles.booleanOption,
                formData[field.key] === true && { backgroundColor: accent, borderColor: accent }
              ]}
              onPress={() => handleInputChange(field.key, true)}
            >
              <Text style={[
                styles.booleanOptionText,
                formData[field.key] === true && { color: '#fff' }
              ]}>
                Yes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.booleanOption,
                formData[field.key] === false && { backgroundColor: accent, borderColor: accent }
              ]}
              onPress={() => handleInputChange(field.key, false)}
            >
              <Text style={[
                styles.booleanOptionText,
                formData[field.key] === false && { color: '#fff' }
              ]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'number':
        const value = formData[field.key] || field.min || 1;
        return (
          <View style={styles.numberContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleInputChange(field.key, Math.max((field.min || 1), value - 1))}
            >
              <Ionicons name="remove" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.numberValue}>{value}</Text>
            
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleInputChange(field.key, Math.min((field.max || 10), value + 1))}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };

  // Progress bar
  const progress = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Course</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%`, backgroundColor: accent }
              ]} 
            />
          </View>
          <Text style={styles.stepText}>Step {currentStep + 1} of {formSteps.length}</Text>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>{formSteps[currentStep].title}</Text>
            <Text style={styles.stepDescription}>{formSteps[currentStep].description}</Text>
            
            {formSteps[currentStep].fields.map((field, index) => (
              <View key={index} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {renderField(field)}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={accent} />
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: accent }]}
              onPress={() => {
                if (currentStep < formSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                  scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
                } else {
                  handleSubmit();
                }
              }}
            >
              <Text style={styles.nextButtonText}>
                {currentStep < formSteps.length - 1 ? 'Next' : 'Create Course'}
              </Text>
              <Ionicons name={currentStep < formSteps.length - 1 ? "arrow-forward" : "checkmark"} size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  keyboardAvoidView: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    color: '#aaa',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  selectOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  booleanContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  booleanOption: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    width: 100,
    alignItems: 'center',
  },
  booleanOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  numberButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  nextButton: {
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CourseCreatorScreen; 