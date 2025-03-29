import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * ReadingActivityScreen - Shows text-based learning content
 */
const ReadingActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get module data from navigation params
  const { activityId, activityTitle } = route.params || {};
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Track completion
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Sample reading content (in a real app, this would come from an API)
  const sampleContent = {
    title: activityTitle || "Introduction to Python",
    sections: [
      {
        title: "Getting Started",
        content: `Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.

Python is dynamically typed and garbage-collected. It supports multiple programming paradigms, including structured (particularly procedural), object-oriented and functional programming.

To get started with Python, you'll need to:
1. Install Python on your computer
2. Set up a code editor or IDE
3. Learn basic syntax and concepts`
      },
      {
        title: "Basic Syntax",
        content: `Python was designed to be highly readable. It uses English keywords frequently, whereas other languages use punctuation, and it has fewer syntactical constructions than other languages.

Python uses indentation to indicate code blocks, rather than curly braces or keywords. An increase in indentation indicates the start of a block, and a decrease in indentation indicates the end of the block.

Here's a simple Python program:

\`\`\`python
# This is a comment
print("Hello, World!")

# Variables
name = "John"
age = 30
print(f"My name is {name} and I am {age} years old.")

# Conditional
if age > 18:
    print("I am an adult")
else:
    print("I am not an adult")
\`\`\``
      },
      {
        title: "Data Types",
        content: `Python has several built-in data types:

1. Numeric Types:
   - int: Integer numbers (e.g., 10, -5)
   - float: Floating-point numbers (e.g., 3.14, -0.5)
   - complex: Complex numbers (e.g., 3+4j)

2. Sequence Types:
   - str: String - sequence of characters (e.g., "Hello")
   - list: Ordered, mutable collection (e.g., [1, 2, 3])
   - tuple: Ordered, immutable collection (e.g., (1, 2, 3))

3. Mapping Type:
   - dict: Key-value pairs (e.g., {"name": "John", "age": 30})

4. Set Types:
   - set: Unordered collection of unique items (e.g., {1, 2, 3})
   - frozenset: Immutable version of set

5. Boolean Type:
   - bool: True or False

6. Binary Types:
   - bytes, bytearray, memoryview

Understanding these data types is crucial for effective Python programming.`
      }
    ]
  };
  
  // Mark as completed when user reaches bottom
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    // When user scrolls to the bottom, mark as completed
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!isCompleted) {
        setIsCompleted(true);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="document-text" size={24} color={accentColor} />
            <Text style={styles.activityType}>Reading</Text>
          </View>
          
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: accentColor }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{sampleContent.title}</Text>
          
          {sampleContent.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton, { backgroundColor: accentColor }]}
          onPress={() => {
            if (isCompleted) {
              console.log('Navigate to next activity');
              navigation.goBack();
            } else {
              console.log('Mark as completed and continue');
              setIsCompleted(true);
            }
          }}
        >
          <Text style={styles.navButtonText}>
            {isCompleted ? 'Next Activity' : 'Mark as Completed'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Space for navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  nextButton: {
    paddingHorizontal: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 5,
  },
});

export default ReadingActivityScreen; 