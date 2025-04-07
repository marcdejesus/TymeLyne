import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

// Import the python course data with a fallback
let pythonCourse;
try {
  pythonCourse = require('../../data/pythonCourse').default;
} catch (error) {
  console.warn('Python course data not found:', error.message);
  pythonCourse = {
    modules: []
  };
}

/**
 * ModuleDetailScreen - Shows detailed breakdown of a learning module's activities
 */
const ModuleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dark, accent } = useTheme();
  
  // Extract module details from route params
  const { moduleId, moduleTitle, moduleIndex } = route.params || {};
  
  // Find the current module data
  const currentModule = pythonCourse.modules.find(module => module.id === moduleId) || 
                       { id: moduleId, title: moduleTitle, activities: [] };
  
  // State to track progress and completion
  const [progress, setProgress] = useState(0);
  const [completedActivities, setCompletedActivities] = useState([]);
  
  // Calculate progress based on completed activities
  useEffect(() => {
    if (currentModule.activities && currentModule.activities.length > 0) {
      const completionPercentage = 
        (completedActivities.length / currentModule.activities.length) * 100;
      setProgress(Math.round(completionPercentage));
    }
  }, [completedActivities, currentModule]);
  
  // Handle activity selection
  const handleSelectActivity = (activity) => {
    // Mark activity as started/viewed
    if (!completedActivities.includes(activity.id)) {
      setCompletedActivities([...completedActivities, activity.id]);
    }
    
    // Navigate to appropriate screen based on activity type
    switch (activity.type) {
      case 'lesson':
        navigation.navigate('Lesson', { 
          activityId: activity.id,
          title: activity.title,
          content: activity.content,
          moduleId: currentModule.id
        });
        break;
      case 'concept-check':
        navigation.navigate('ConceptCheck', {
          activityId: activity.id,
          title: activity.title,
          questions: activity.questions,
          moduleId: currentModule.id
        });
        break;
      case 'practice':
        navigation.navigate('PracticeActivity', {
          activityId: activity.id,
          title: activity.title,
          instructions: activity.instructions,
          starterCode: activity.starterCode,
          solution: activity.solution,
          moduleId: currentModule.id
        });
        break;
      case 'quiz':
        navigation.navigate('NewQuiz', {
          activityId: activity.id,
          title: activity.title,
          questions: activity.questions,
          moduleId: currentModule.id
        });
        break;
      case 'challenge':
        navigation.navigate('Challenge', {
          activityId: activity.id,
          title: activity.title,
          content: activity.content,
          starterCode: activity.starterCode,
          solution: activity.solution,
          hints: activity.hints,
          time: activity.time,
          moduleId: currentModule.id
        });
        break;
      default:
        console.warn(`Unknown activity type: ${activity.type}`);
    }
  };
  
  // Check if all activities are completed
  const allActivitiesCompleted = currentModule.activities && 
    currentModule.activities.length > 0 && 
    completedActivities.length === currentModule.activities.length;
  
  // Render activity item in the list
  const renderActivityItem = ({ item, index }) => {
    // Determine if this activity is available (previous one completed or first one)
    const isAvailable = index === 0 || completedActivities.includes(currentModule.activities[index-1].id);
    const isCompleted = completedActivities.includes(item.id);
    
    let activityIcon;
    switch (item.type) {
      case 'lesson':
        activityIcon = 'book-outline';
        break;
      case 'concept-check':
        activityIcon = 'checkmark-circle-outline';
        break;
      case 'practice':
        activityIcon = 'code-slash-outline';
        break;
      case 'quiz':
        activityIcon = 'help-circle-outline';
        break;
      case 'challenge':
        activityIcon = 'trophy-outline';
        break;
      default:
        activityIcon = 'document-outline';
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.activityItem,
          isCompleted ? styles.activityItemCompleted : null,
          !isAvailable ? styles.activityItemLocked : null,
        ]}
        onPress={() => isAvailable ? handleSelectActivity(item) : null}
        disabled={!isAvailable}
      >
        <View style={styles.activityIconContainer}>
          <Ionicons 
            name={isCompleted ? 'checkmark-circle' : activityIcon} 
            size={24} 
            color={isCompleted ? '#4CD964' : isAvailable ? accent : '#777'}
          />
        </View>
        
        <View style={styles.activityContent}>
          <Text style={[
            styles.activityTitle,
            !isAvailable ? styles.activityTitleLocked : null
          ]}>
            {item.title}
          </Text>
          
          <View style={styles.activityMeta}>
            <Text style={styles.activityType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            {isCompleted && <Text style={styles.activityCompleted}>Completed</Text>}
            {!isAvailable && <Text style={styles.activityLocked}>Locked</Text>}
          </View>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isAvailable ? accent : '#777'}
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentModule.title}</Text>
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
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
      
      <FlatList
        data={currentModule.activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        contentContainerStyle={styles.activitiesList}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Activities (Linear Sequence)</Text>
        }
        ListFooterComponent={
          allActivitiesCompleted ? (
            <TouchableOpacity 
              style={[styles.completionButton, { backgroundColor: accent }]}
              onPress={() => navigation.navigate('Reflection', {
                moduleId: currentModule.id,
                moduleTitle: currentModule.title
              })}
            >
              <Text style={styles.completionButtonText}>
                Complete Module
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
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
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#aaa',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activitiesList: {
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
  },
  activityItemCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CD964',
  },
  activityItemLocked: {
    opacity: 0.7,
  },
  activityIconContainer: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityTitleLocked: {
    color: '#999',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityType: {
    color: '#999',
    fontSize: 14,
    marginRight: 10,
  },
  activityCompleted: {
    color: '#4CD964',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityLocked: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completionButton: {
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModuleDetailScreen; 