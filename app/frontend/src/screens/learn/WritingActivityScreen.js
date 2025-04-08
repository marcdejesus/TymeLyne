import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const WritingActivityScreen = ({ route }) => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const { activity, moduleId } = route.params;
  
  // State variables
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [showSample, setShowSample] = useState(false);
  
  // Handle submitting solution
  const handleSubmit = () => {
    if (solution.trim().length === 0) {
      setFeedback({
        type: 'error',
        message: 'Please write your solution before submitting.'
      });
      return;
    }
    
    // Here you would normally send the solution to a backend for evaluation
    // For this example, we'll just mark it as completed if there's any content
    setFeedback({
      type: 'success',
      message: 'Your solution has been submitted successfully!'
    });
    setCompleted(true);
  };
  
  // Handle showing sample solution
  const toggleSampleSolution = () => {
    setShowSample(!showSample);
  };
  
  // Handle completing the activity
  const handleComplete = () => {
    // In a real app, you would save this to your backend/state management
    navigation.goBack();
  };
  
  // Render feedback message
  const renderFeedback = () => {
    if (!feedback) return null;
    
    return (
      <View style={[
        styles.feedbackContainer,
        feedback.type === 'success' ? styles.successFeedback : styles.errorFeedback
      ]}>
        <Ionicons 
          name={feedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
          size={24} 
          color={feedback.type === 'success' ? '#4CAF50' : '#F44336'} 
          style={styles.feedbackIcon}
        />
        <Text style={[
          styles.feedbackText,
          feedback.type === 'success' ? styles.successText : styles.errorText
        ]}>
          {feedback.message}
        </Text>
      </View>
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
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={styles.content}
        >
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructions}>{activity.content.instructions}</Text>
          
          <View style={styles.taskContainer}>
            {activity.content.tasks.map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <Text style={styles.taskBullet}>•</Text>
                <Text style={styles.taskText}>{task}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.solutionLabel}>Your Solution:</Text>
          
          <TextInput
            style={[styles.solutionInput, { borderColor: accent }]}
            value={solution}
            onChangeText={setSolution}
            placeholder="Write your solution here..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            editable={!completed}
          />
          
          {renderFeedback()}
          
          <TouchableOpacity 
            style={styles.sampleButton}
            onPress={toggleSampleSolution}
          >
            <Text style={[styles.sampleButtonText, { color: accent }]}>
              {showSample ? 'Hide Sample Solution' : 'Show Sample Solution'}
            </Text>
            <Ionicons 
              name={showSample ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={accent} 
            />
          </TouchableOpacity>
          
          {showSample && (
            <View style={styles.sampleContainer}>
              <Text style={styles.sampleTitle}>Sample Solution:</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{activity.content.sampleSolution}</Text>
              </View>
              <Text style={styles.sampleNote}>
                Note: This is just one possible solution. There are many ways to solve this problem correctly.
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          {completed ? (
            <TouchableOpacity 
              style={[styles.bottomButton, { backgroundColor: accent }]}
              onPress={handleComplete}
            >
              <Text style={styles.bottomButtonText}>Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.bottomButton, { backgroundColor: accent }]}
              onPress={handleSubmit}
            >
              <Text style={styles.bottomButtonText}>Submit Solution</Text>
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 16,
    color: '#EEEEEE',
    marginBottom: 20,
    lineHeight: 24,
  },
  taskContainer: {
    marginBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  taskBullet: {
    fontSize: 16,
    color: '#EEEEEE',
    marginRight: 8,
  },
  taskText: {
    fontSize: 16,
    color: '#EEEEEE',
    flex: 1,
    lineHeight: 24,
  },
  solutionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  solutionInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 200,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successFeedback: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  errorFeedback: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  feedbackIcon: {
    marginRight: 8,
  },
  feedbackText: {
    fontSize: 16,
    flex: 1,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  sampleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  sampleContainer: {
    marginBottom: 24,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  codeText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  sampleNote: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
});

export default WritingActivityScreen; 