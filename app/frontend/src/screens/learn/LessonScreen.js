import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Markdown from 'react-native-markdown-display';

const LessonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { lesson } = route.params || {};

  // State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState(null);

  // Sample lesson data - would come from API in real app
  const lessonData = lesson || {
    id: 'python-variables',
    title: 'Variables and Data Types in Python',
    module: 'Python Basics',
    moduleNumber: 1,
    sectionNumber: 2,
    totalSections: 5,
    content: [
      {
        title: 'Introduction to Variables',
        body: `# Variables in Python

Variables are like containers for storing data values. In Python, a variable is created the moment you first assign a value to it.

\`\`\`python
# Variable assignment
name = "John"
age = 30
is_student = True
\`\`\`

Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.`
      },
      {
        title: 'Data Types',
        body: `# Python Data Types

Python has the following standard data types:

* **Text Type**: str
* **Numeric Types**: int, float, complex
* **Sequence Types**: list, tuple, range
* **Mapping Type**: dict
* **Set Types**: set, frozenset
* **Boolean Type**: bool
* **Binary Types**: bytes, bytearray, memoryview
* **None Type**: None

You can always check the type of a variable with the \`type()\` function:

\`\`\`python
x = 5
print(type(x))  # <class 'int'>
\`\`\`

Python is dynamically typed, which means the type of a variable is determined at runtime.`
      },
      {
        title: 'Type Conversion',
        body: `# Type Conversion in Python

You can convert from one type to another with these functions:

* \`int()\` - constructs an integer from a string or float
* \`float()\` - constructs a float from a string or integer
* \`str()\` - constructs a string from various data types

\`\`\`python
# Converting between types
x = 1      # int
y = 2.8    # float
z = "3"    # str

# Convert from int to float:
a = float(x)  # Result: 1.0

# Convert from float to int:
b = int(y)    # Result: 2 (note it truncates, not rounds!)

# Convert from int to str:
c = str(x)    # Result: "1"

# Convert from str to int:
d = int(z)    # Result: 3
\`\`\`

Be careful when attempting to convert strings to numbers. The string must represent a valid number, or you'll get an error.`
      }
    ],
    xpReward: 50,
    timeEstimate: '10 minutes'
  };

  // Calculate progress
  const progress = ((currentSection + 1) / lessonData.content.length) * 100;

  // Handle bookmark toggle
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, save this to user's data
  };

  // Handle text-to-speech
  const toggleTextToSpeech = () => {
    // In a real app, this would use a text-to-speech API
    if (isPlaying) {
      setIsPlaying(false);
      // Stop speech
    } else {
      setIsLoading(true);
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(true);
        // Start speech
      }, 1000);
    }
  };

  // Handle navigation between sections
  const goToNextSection = () => {
    if (currentSection < lessonData.content.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Last section, complete the lesson
      Alert.alert(
        "Lesson Complete!",
        "You've completed this lesson.",
        [
          { 
            text: "Continue", 
            onPress: () => navigation.navigate('ConceptCheck', {
              lessonId: lessonData.id,
              title: lessonData.title,
            })
          }
        ]
      );
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Handle text selection for highlighting
  const handleTextSelection = (text) => {
    // In a real app, this would store the highlighted text
    setSelectedText(text);
    Alert.alert(
      "Text Selected",
      "Would you like to highlight this text?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Highlight", onPress: () => console.log("Text highlighted:", text) }
      ]
    );
  };
  
  // Current section content
  const currentContent = lessonData.content[currentSection];

  // Markdown style rules
  const markdownStyles = {
    body: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    heading1: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 24,
      marginBottom: 16,
      marginTop: 16,
    },
    heading2: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 20,
      marginBottom: 12,
      marginTop: 16,
    },
    paragraph: {
      color: '#EEEEEE',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 16,
    },
    list_item: {
      color: '#EEEEEE',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 16,
    },
    code_block: {
      backgroundColor: '#2A2A2A',
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
    },
    code_inline: {
      backgroundColor: '#2A2A2A',
      color: accent,
      padding: 4,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: '#2A2A2A',
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
    },
    link: {
      color: accent,
      textDecorationLine: 'underline',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: accent,
      paddingLeft: 16,
      marginVertical: 12,
      opacity: 0.9,
    },
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
        <Text style={styles.headerTitle}>{lessonData.title}</Text>
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={toggleBookmark}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? accent : "#FFFFFF"} 
          />
        </TouchableOpacity>
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
          {currentSection + 1} of {lessonData.content.length}
        </Text>
      </View>
      
      {/* Section title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{currentContent.title}</Text>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
      >
        <Markdown 
          style={markdownStyles}
          onLinkPress={(url) => Linking.openURL(url)}
        >
          {currentContent.body}
        </Markdown>
      </ScrollView>
      
      {/* Floating action buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, isPlaying && styles.activeButton]}
          onPress={toggleTextToSpeech}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons 
              name={isPlaying ? "volume-high" : "volume-medium"} 
              size={22} 
              color="#FFFFFF" 
            />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Bottom navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.prevButton,
            currentSection === 0 && styles.disabledButton
          ]}
          onPress={goToPreviousSection}
          disabled={currentSection === 0}
        >
          <Ionicons name="arrow-back" size={22} color={currentSection === 0 ? "#666666" : "#FFFFFF"} />
          <Text style={[styles.navButtonText, currentSection === 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton, { backgroundColor: accent }]}
          onPress={goToNextSection}
        >
          <Text style={styles.navButtonText}>
            {currentSection === lessonData.content.length - 1 ? "Complete" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  bookmarkButton: {
    padding: 8,
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
  sectionTitleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activeButton: {
    backgroundColor: '#FF9500',
  },
  bottomContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    padding: 16,
    paddingBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  prevButton: {
    backgroundColor: '#444444',
  },
  nextButton: {
    backgroundColor: '#FF9500',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  disabledText: {
    color: '#666666',
  },
});

export default LessonScreen; 