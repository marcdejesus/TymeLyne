import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Markdown from 'react-native-markdown-display';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * ReadingActivityScreen - Shows text-based learning content
 */
const ReadingActivityScreen = ({ route }) => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const { activity, moduleId } = route.params;
  const [completed, setCompleted] = useState(activity.completed);
  
  // Handle marking activity as completed
  const handleComplete = () => {
    // Update completed status
    setCompleted(true);
    
    // In a real app, you would save this to your backend/state management
    
    // Navigate back to module detail
    navigation.goBack();
  };
  
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
    heading3: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 8,
      marginTop: 12,
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
    ordered_list: {
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
        <Text style={styles.headerTitle}>{activity.title}</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      {/* Content */}
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.content}>
        <Markdown style={markdownStyles}>
          {activity.content.text}
        </Markdown>
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.completeButton, { backgroundColor: accent }]}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>
            {completed ? 'Completed' : 'Mark as Completed'}
          </Text>
          {completed && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkIcon} />}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholderRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default ReadingActivityScreen; 