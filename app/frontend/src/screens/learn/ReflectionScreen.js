import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const ReflectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { moduleId, courseId } = route.params || {};
  
  // Animation value for submission success
  const successAnim = React.useRef(new Animated.Value(0)).current;
  
  // State for form inputs
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  const [learnings, setLearnings] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Difficulty options
  const difficultyOptions = [
    { value: 'too_easy', label: 'Too Easy' },
    { value: 'just_right', label: 'Just Right' },
    { value: 'challenging', label: 'Challenging' },
    { value: 'too_difficult', label: 'Too Difficult' },
  ];
  
  // Handle form submission
  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please rate your experience before submitting.');
      return;
    }
    
    // In a real app, this would send data to an API
    console.log({
      moduleId,
      courseId,
      rating,
      difficulty,
      learnings,
      improvements,
      timestamp: new Date().toISOString(),
    });
    
    // Show success animation
    setIsSubmitted(true);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
    ]).start(() => {
      // Navigate back to course progress after submission
      navigation.navigate('CourseProgress', { courseId });
    });
  };
  
  // Cancel and go back
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Render the star rating component
  const renderRating = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={36}
              color={rating >= star ? accent : '#777777'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Success animation styles
  const successScale = successAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.2, 1],
  });
  
  const successOpacity = successAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1],
  });
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reflection & Feedback</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {isSubmitted ? (
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            }
          ]}
        >
          <View style={[styles.successIcon, { backgroundColor: accent }]}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your feedback helps us improve our learning content.
          </Text>
        </Animated.View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Reflect on Your Learning</Text>
            <Text style={styles.subtitle}>
              Take a moment to think about what you've learned and how we can improve
            </Text>
            
            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How would you rate this module?</Text>
              {renderRating()}
            </View>
            
            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How was the difficulty level?</Text>
              <View style={styles.difficultyOptions}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.difficultyOption,
                      difficulty === option.value && [
                        styles.selectedDifficulty,
                        { borderColor: accent }
                      ]
                    ]}
                    onPress={() => setDifficulty(option.value)}
                  >
                    <Text 
                      style={[
                        styles.difficultyText,
                        difficulty === option.value && { color: accent }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* What you learned */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What did you learn in this module?</Text>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#777777"
                placeholder="Share the key concepts you learned..."
                multiline
                value={learnings}
                onChangeText={setLearnings}
              />
            </View>
            
            {/* Improvement suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How can we improve this module?</Text>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#777777"
                placeholder="Any suggestions for making this module better..."
                multiline
                value={improvements}
                onChangeText={setImprovements}
              />
            </View>
            
            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: accent }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Reflection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    padding: 8,
  },
  difficultyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  difficultyOption: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedDifficulty: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ReflectionScreen; 