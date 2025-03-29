import React, { useState } from 'react';
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

/**
 * ModuleDetailScreen - Shows detailed breakdown of a learning module's activities
 */
const ModuleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get module data from navigation params
  const { moduleId, moduleTitle, moduleIndex } = route.params || {};
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Activity types with icons and colors
  const activityTypes = [
    { id: 'readings', title: 'Readings', icon: 'document-text', color: accentColor },
    { id: 'interactive', title: 'Interactive Exercises', icon: 'code-working', color: '#3498DB' },
    { id: 'matching', title: 'Matching Games', icon: 'shuffle', color: '#9B59B6' },
    { id: 'quizzes', title: 'Quizzes', icon: 'help-circle', color: '#2ECC71' },
  ];
  
  // Sample activities for each type
  const activities = {
    readings: [
      { id: 'r1', title: 'Introduction to Python Syntax', duration: '10 min', completed: true },
      { id: 'r2', title: 'Variables and Data Types', duration: '15 min', completed: true },
      { id: 'r3', title: 'Control Flow Statements', duration: '20 min', completed: false },
    ],
    interactive: [
      { id: 'i1', title: 'First Python Program', duration: '15 min', completed: false },
      { id: 'i2', title: 'Working with Variables', duration: '20 min', completed: false },
    ],
    matching: [
      { id: 'm1', title: 'Match Syntax with Descriptions', duration: '10 min', completed: false },
      { id: 'm2', title: 'Data Types Match Game', duration: '10 min', completed: false },
    ],
    quizzes: [
      { id: 'q1', title: 'Python Basics Quiz', duration: '15 min', completed: false },
      { id: 'q2', title: 'Variables and Data Types Quiz', duration: '10 min', completed: false },
    ],
  };
  
  // Active activity type
  const [activeType, setActiveType] = useState('readings');
  
  // Calculate progress for the module
  const allActivities = [
    ...activities.readings,
    ...activities.interactive,
    ...activities.matching,
    ...activities.quizzes,
  ];
  
  const completedCount = allActivities.filter(activity => activity.completed).length;
  const totalCount = allActivities.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  
  // Navigate to activity based on selected type and activity
  const handleSelectActivity = (activity) => {
    // If already completed, do nothing special
    console.log('Selected activity:', activity);
    
    // Based on activity type, navigate to the appropriate screen
    switch(activity.type) {
      case 'reading':
        navigation.navigate('ReadingActivity', {
          activityId: activity.id,
          activityTitle: activity.title,
        });
        break;
      case 'quiz':
        navigation.navigate('QuizActivity', {
          activityId: activity.id,
          activityTitle: activity.title,
        });
        break;
      case 'matching':
        navigation.navigate('MatchingActivity', {
          activityId: activity.id,
          activityTitle: activity.title,
        });
        break;
      case 'writing':
        navigation.navigate('WritingActivity', {
          activityId: activity.id,
          activityTitle: activity.title,
        });
        break;
      default:
        // For other types or fallback
        Alert.alert('Coming Soon', 'This activity type is under development.');
    }
  };
  
  // Find the first incomplete activity or the first activity if all are complete
  const findNextActivity = () => {
    for (const type of activityTypes) {
      const activitiesForType = activities.filter(a => a.type === type.id);
      const incompleteActivity = activitiesForType.find(a => !a.completed);
      
      if (incompleteActivity) {
        return incompleteActivity;
      }
    }
    // If all complete, return the first activity
    return activities[0];
  };
  
  // Handle continue button press
  const handleContinue = () => {
    const nextActivity = findNextActivity();
    if (nextActivity) {
      handleSelectActivity(nextActivity);
    }
  };
  
  // Render an activity item
  const renderActivityItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => handleSelectActivity(item)}
    >
      <View style={styles.activityLeft}>
        <View style={[
          styles.activityStatus,
          { backgroundColor: item.completed ? accentColor : '#444' }
        ]}>
          <Ionicons 
            name={item.completed ? "checkmark" : "time-outline"} 
            size={14} 
            color="#fff" 
          />
        </View>
        <Text style={[
          styles.activityTitle,
          item.completed && styles.completedText
        ]}>
          {item.title}
        </Text>
      </View>
      
      <View style={styles.activityRight}>
        <Text style={styles.activityDuration}>{item.duration}</Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color="#999" 
        />
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Module header */}
        <View style={styles.header}>
          <Text style={styles.moduleNumber}>Module {moduleIndex}</Text>
          <Text style={styles.moduleTitle}>{moduleTitle}</Text>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%`, backgroundColor: accentColor }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
          </View>
        </View>
        
        {/* Activity types selector */}
        <View style={styles.typesContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typesContent}
          >
            {activityTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  activeType === type.id && [styles.activeTypeButton, { borderColor: type.color }]
                ]}
                onPress={() => setActiveType(type.id)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={20} 
                  color={activeType === type.id ? type.color : '#999'} 
                  style={styles.typeIcon}
                />
                <Text 
                  style={[
                    styles.typeText, 
                    activeType === type.id && { color: type.color }
                  ]}
                >
                  {type.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Activity list for selected type */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>
            {activityTypes.find(t => t.id === activeType)?.title || 'Activities'}
          </Text>
          
          {activities[activeType]?.length > 0 ? (
            activities[activeType].map(activity => renderActivityItem({ item: activity }))
          ) : (
            <Text style={styles.emptyText}>No activities found.</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Continue button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: accentColor }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
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
    paddingBottom: 80, // Space for the continue button
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  moduleNumber: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  moduleTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'right',
  },
  typesContainer: {
    marginVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  typesContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#252525',
  },
  activeTypeButton: {
    backgroundColor: '#2A2A2A',
  },
  typeIcon: {
    marginRight: 5,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
  },
  activitiesContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  completedText: {
    color: '#999',
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDuration: {
    color: '#999',
    fontSize: 14,
    marginRight: 10,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default ModuleDetailScreen; 