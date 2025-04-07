import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const PracticeActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { lessonId, title } = route.params || {};
  
  // State
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Sample practice data - would come from API in real app
  const practiceData = {
    id: 'practice-python-vars',
    title: title || 'Variables Practice',
    lessonId: lessonId || 'python-variables',
    description: "Let's practice creating and using variables in Python. Follow the instructions for each step.",
    steps: [
      {
        id: 'step1',
        instructions: "Create a variable called 'name' and assign your name as a string to it.",
        startingCode: "# Create the 'name' variable here",
        expectedOutput: null,
        solution: "name = \"Your Name\"",
        hint: "Use the assignment operator (=) to assign a string value to a variable. For example: variable_name = \"string value\"",
        validationFunction: (code) => {
          return code.includes('name =') && 
                 (code.includes('"') || code.includes("'"));
        }
      },
      {
        id: 'step2',
        instructions: "Create a variable called 'age' and assign it an integer value.",
        startingCode: "# You already have:\nname = \"Your Name\"\n\n# Now add the 'age' variable",
        expectedOutput: null,
        solution: "age = 25",
        hint: "Use the assignment operator (=) to assign a number to a variable. You don't need quotes for numbers.",
        validationFunction: (code) => {
          return code.includes('age =') && 
                 /age\s*=\s*\d+/.test(code);
        }
      },
      {
        id: 'step3',
        instructions: "Create a variable called 'is_student' and assign it a boolean value (True or False).",
        startingCode: "# You already have:\nname = \"Your Name\"\nage = 25\n\n# Now add the 'is_student' variable",
        expectedOutput: null,
        solution: "is_student = True",
        hint: "Boolean values in Python are written as True or False (with capital first letter and no quotes).",
        validationFunction: (code) => {
          return code.includes('is_student =') && 
                 (code.includes('True') || code.includes('False'));
        }
      },
      {
        id: 'step4',
        instructions: "Now create a print statement that outputs a sentence using all three variables.",
        startingCode: "# You already have:\nname = \"Your Name\"\nage = 25\nis_student = True\n\n# Now write a print statement using all three variables",
        expectedOutput: null,
        solution: "print(f\"My name is {name}, I am {age} years old, and it is {is_student} that I am a student.\")",
        hint: "You can use f-strings to include variables in a string. Example: print(f\"Hello, {name}\")",
        validationFunction: (code) => {
          return code.includes('print') && 
                 code.includes('name') && 
                 code.includes('age') && 
                 code.includes('is_student');
        }
      },
    ],
    xpReward: 75
  };
  
  // Current step
  const currentStepData = practiceData.steps[currentStep];
  
  // Initialize code state for first render
  const isInitialized = useRef(false);
  if (!isInitialized.current && currentStepData) {
    setCode(currentStepData.startingCode);
    isInitialized.current = true;
  }
  
  // Calculate progress
  const progress = ((currentStep + 1) / practiceData.steps.length) * 100;
  
  // Run code
  const runCode = () => {
    Keyboard.dismiss();
    setIsRunning(true);
    
    // Simulate execution (in a real app, this would call an actual interpreter)
    setTimeout(() => {
      // For this demo, we'll just simulate output
      try {
        if (code.includes('print')) {
          // Extract what's inside the print statement
          const printMatch = code.match(/print\((.*)\)/);
          if (printMatch && printMatch[1]) {
            // Replace variable references with their "values"
            let result = printMatch[1];
            
            // Handle f-strings
            if (result.startsWith('f"') || result.startsWith("f'")) {
              result = result
                .replace(/f["']/g, '')
                .replace(/["']$/g, '')
                .replace(/{name}/g, '"Your Name"')
                .replace(/{age}/g, '25')
                .replace(/{is_student}/g, 'True');
            }
            
            setOutput(result);
          } else {
            setOutput('');
          }
        } else {
          setOutput('No output (no print statement found)');
        }
        
        // Check if the code passes validation
        if (currentStepData.validationFunction(code)) {
          // Success!
          setTimeout(() => {
            Alert.alert(
              'Success!', 
              'Your code works as expected!',
              [
                { 
                  text: 'Continue', 
                  onPress: handleNextStep
                }
              ]
            );
          }, 500);
        }
        
        setIsRunning(false);
      } catch (error) {
        setOutput(`Error: ${error.message}`);
        setIsRunning(false);
      }
    }, 800);
  };
  
  // Reset code to starting point
  const resetCode = () => {
    setCode(currentStepData.startingCode);
    setOutput('');
  };
  
  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Handle moving to next step
  const handleNextStep = () => {
    if (currentStep < practiceData.steps.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1);
      setShowHint(false);
      setOutput('');
      
      // Initialize code for next step
      const nextStep = practiceData.steps[currentStep + 1];
      if (nextStep) {
        setCode(nextStep.startingCode);
      }
    } else {
      // All steps completed!
      setIsCompleted(true);
    }
  };
  
  // Handle completion
  const handleCompletion = () => {
    // Navigate to the next activity (quiz)
    navigation.navigate('QuizActivity', {
      lessonId: practiceData.lessonId,
      title: practiceData.title
    });
  };
  
  // Render completion screen
  const renderCompletionScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.completionContainer}>
          <Ionicons 
            name="checkmark-circle" 
            size={80} 
            color="#4CAF50" 
            style={styles.completionIcon}
          />
          
          <Text style={styles.completionTitle}>Practice Complete!</Text>
          
          <Text style={styles.completionText}>
            You've successfully completed all the practice steps. Great job applying the concepts!
          </Text>
          
          <View style={styles.xpContainer}>
            <Ionicons name="trophy" size={24} color={accent} />
            <Text style={styles.xpText}>+{practiceData.xpReward} XP</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.completionButton, { backgroundColor: accent }]}
            onPress={handleCompletion}
          >
            <Text style={styles.completionButtonText}>Continue to Quiz</Text>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  
  // Show completion screen if practice is completed
  if (isCompleted) {
    return renderCompletionScreen();
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
        <Text style={styles.headerTitle}>Practice Activity</Text>
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
          Step {currentStep + 1} of {practiceData.steps.length}
        </Text>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>{currentStepData.instructions}</Text>
        
        <TouchableOpacity 
          style={styles.hintButton}
          onPress={toggleHint}
        >
          <Ionicons name="bulb-outline" size={20} color={accent} />
          <Text style={[styles.hintButtonText, { color: accent }]}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Text>
        </TouchableOpacity>
        
        {showHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>{currentStepData.hint}</Text>
          </View>
        )}
      </View>
      
      {/* Code editor */}
      <View style={styles.editorContainer}>
        <View style={styles.editorHeader}>
          <Text style={styles.editorTitle}>Code Editor</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetCode}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.codeEditor}
          value={code}
          onChangeText={setCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder="Write your code here..."
          placeholderTextColor="#666666"
        />
        
        <TouchableOpacity 
          style={[styles.runButton, { backgroundColor: isRunning ? '#555555' : accent }]}
          onPress={runCode}
          disabled={isRunning}
        >
          {isRunning ? (
            <Text style={styles.runButtonText}>Running...</Text>
          ) : (
            <>
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={styles.runButtonText}>Run Code</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Output */}
      <View style={styles.outputContainer}>
        <Text style={styles.outputTitle}>Output:</Text>
        <ScrollView style={styles.outputContent}>
          <Text style={styles.outputText}>{output}</Text>
        </ScrollView>
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
  instructionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  hintContainer: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  hintText: {
    color: '#DDDDDD',
    fontSize: 14,
    lineHeight: 20,
  },
  editorContainer: {
    flex: 1,
    margin: 16,
    marginTop: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  editorTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  codeEditor: {
    flex: 1,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  outputContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
    height: 120,
  },
  outputTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 12,
    backgroundColor: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  outputContent: {
    padding: 12,
  },
  outputText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontFamily: 'monospace',
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
    lineHeight: 26,
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
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  completionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});

export default PracticeActivityScreen; 