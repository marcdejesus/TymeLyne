import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * WritingActivityScreen - Screen for written response activities
 */
const WritingActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  
  // Get activity data from navigation params
  const { activityId, activityTitle } = route.params || {};
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Activity data state
  const [responses, setResponses] = useState(['', '', '']);
  const [wordCounts, setWordCounts] = useState([0, 0, 0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Sample activity data (in a real app, this would come from an API)
  const activityData = {
    title: activityTitle || "Python Reflection Exercise",
    introduction: `In this activity, you'll reflect on what you've learned about Python programming so far. Answer the questions thoughtfully to reinforce your understanding.`,
    prompts: [
      {
        question: "Explain the difference between a list and a tuple in Python. When would you use one over the other?",
        minWords: 30,
        placeholder: "Write your answer here...",
      },
      {
        question: "Describe a real-world problem that could be solved using Python. What specific features of Python would be useful for solving this problem?",
        minWords: 50,
        placeholder: "Write your answer here...",
      },
      {
        question: "Reflect on your experience learning Python so far. What concepts have you found most challenging, and what strategies have helped you understand them better?",
        minWords: 40,
        placeholder: "Write your answer here...",
      }
    ]
  };
  
  // Calculate word count for a given text
  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };
  
  // Handle text input change
  const handleTextChange = (text, index) => {
    const newResponses = [...responses];
    newResponses[index] = text;
    setResponses(newResponses);
    
    const newWordCounts = [...wordCounts];
    newWordCounts[index] = getWordCount(text);
    setWordCounts(newWordCounts);
  };
  
  // Check if all responses meet minimum word count
  const areResponsesValid = () => {
    return responses.every((response, index) => 
      getWordCount(response) >= activityData.prompts[index].minWords
    );
  };
  
  // Handle submission
  const handleSubmit = () => {
    if (!areResponsesValid()) {
      Alert.alert(
        "Incomplete Responses",
        "Please make sure all of your responses meet the minimum word count requirements.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // In a real app, this would send the responses to an API
    console.log('Submitting responses:', responses);
    
    // Show success message and generate feedback
    setIsSubmitted(true);
    
    // Generate simple feedback (in a real app, this might come from an API or instructor)
    const feedbackText = `
Great work on completing this writing activity! 

Your responses demonstrate thoughtful reflection on Python concepts and your learning journey. Your explanation of lists vs. tuples shows good technical understanding, and your example of a real-world application is practical and well-considered.

Continue to practice these concepts and apply them in your own projects to deepen your understanding.

Total words written: ${wordCounts.reduce((sum, count) => sum + count, 0)}
    `;
    
    setFeedback(feedbackText);
  };
  
  // Reset the form
  const handleReset = () => {
    if (responses.some(resp => resp.trim() !== '')) {
      Alert.alert(
        "Reset Responses?",
        "This will clear all your answers. Are you sure you want to continue?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            style: "destructive",
            onPress: () => {
              setResponses(['', '', '']);
              setWordCounts([0, 0, 0]);
              setIsSubmitted(false);
              setFeedback('');
            }
          }
        ]
      );
    }
  };
  
  // Render each prompt and response field
  const renderPrompts = () => {
    return activityData.prompts.map((prompt, index) => (
      <View key={index} style={styles.promptContainer}>
        <Text style={styles.questionText}>{prompt.question}</Text>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.textInput,
              responses[index].length > 0 && styles.activeTextInput,
              isSubmitted && styles.submittedTextInput
            ]}
            placeholder={prompt.placeholder}
            placeholderTextColor="#777"
            multiline
            textAlignVertical="top"
            value={responses[index]}
            onChangeText={(text) => handleTextChange(text, index)}
            editable={!isSubmitted}
          />
        </View>
        
        <View style={styles.wordCountContainer}>
          <Text style={[
            styles.wordCount,
            wordCounts[index] >= prompt.minWords 
              ? styles.validWordCount 
              : styles.invalidWordCount
          ]}>
            {wordCounts[index]}/{prompt.minWords} words minimum
          </Text>
        </View>
      </View>
    ));
  };
  
  // Render feedback after submission
  const renderFeedback = () => {
    return (
      <View style={styles.feedbackContainer}>
        <View style={[styles.feedbackHeader, { backgroundColor: accentColor }]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.feedbackHeaderText}>Activity Completed</Text>
        </View>
        
        <Text style={styles.feedbackText}>{feedback}</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: accentColor }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Return to Module</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (!isSubmitted && responses.some(resp => resp.trim() !== '')) {
                Alert.alert(
                  "Exit Activity?",
                  "Your answers have not been submitted. Are you sure you want to exit?",
                  [
                    { text: "Stay", style: "cancel" },
                    { text: "Exit", onPress: () => navigation.goBack() }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="create-outline" size={24} color={accentColor} />
            <Text style={styles.headerTitle}>Writing Activity</Text>
          </View>
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Activity Information */}
          <Text style={styles.title}>{activityData.title}</Text>
          <Text style={styles.introText}>{activityData.introduction}</Text>
          
          {/* Prompts and Input Fields */}
          {renderPrompts()}
          
          {/* Feedback Section */}
          {isSubmitted && renderFeedback()}
          
          {/* Action Buttons */}
          {!isSubmitted && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.submitButton, 
                  { backgroundColor: accentColor },
                  !areResponsesValid() && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={!areResponsesValid()}
              >
                <Text style={styles.buttonText}>Submit</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  keyboardContainer: {
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  introText: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  promptContainer: {
    marginBottom: 30,
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInputContainer: {
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444',
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 150,
    maxHeight: 300,
    textAlignVertical: 'top',
  },
  activeTextInput: {
    borderColor: DEFAULT_ACCENT_COLOR,
  },
  submittedTextInput: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
  wordCountContainer: {
    alignItems: 'flex-end',
  },
  wordCount: {
    fontSize: 14,
    marginTop: 5,
  },
  validWordCount: {
    color: '#4CAF50',
  },
  invalidWordCount: {
    color: '#FF5252',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
  },
  resetButton: {
    backgroundColor: '#555',
  },
  submitButton: {
    paddingHorizontal: 30,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  feedbackHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 15,
  },
});

export default WritingActivityScreen; 