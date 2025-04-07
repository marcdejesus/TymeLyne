import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Import Python course data
import pythonCourse from '../../data/pythonCourse';

const CourseProgressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accent } = useTheme();
  const { courseId } = route.params || { courseId: pythonCourse.id };
  
  // Get course data - in a real app, this would come from an API or Redux store
  const courseData = courseId === pythonCourse.id ? pythonCourse : pythonCourse;
  
  // Timeline filter state
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'in-progress'
  
  // Get activities from all modules
  const activities = courseData.modules.flatMap((module, moduleIndex) => {
    return module.activities.map((activity, activityIndex) => {
      return {
        ...activity,
        moduleTitle: module.title,
        moduleIndex: moduleIndex + 1,
        activityIndex: activityIndex + 1,
      };
    });
  });
  
  // Filter activities based on current filter
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'completed') return activity.completed;
    if (filter === 'in-progress') return !activity.completed;
    return true;
  });
  
  const completedCount = activities.filter(activity => activity.completed).length;
  const progressPercentage = Math.round((completedCount / activities.length) * 100);
  
  // Format date for timeline
  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <Text style={styles.headerTitle}>Course Progress</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {/* Share functionality */}}
        >
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Course Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.courseTitle}>{courseData.title}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{progressPercentage}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Activities Done</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{activities.length - completedCount}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%`, backgroundColor: accent }
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filter === 'all' && [styles.activeFilter, { borderColor: accent }]
            ]}
            onPress={() => setFilter('all')}
          >
            <Text 
              style={[
                styles.filterText, 
                filter === 'all' && { color: accent }
              ]}
            >
              All Activities
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filter === 'completed' && [styles.activeFilter, { borderColor: accent }]
            ]}
            onPress={() => setFilter('completed')}
          >
            <Text 
              style={[
                styles.filterText, 
                filter === 'completed' && { color: accent }
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filter === 'in-progress' && [styles.activeFilter, { borderColor: accent }]
            ]}
            onPress={() => setFilter('in-progress')}
          >
            <Text 
              style={[
                styles.filterText, 
                filter === 'in-progress' && { color: accent }
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Timeline */}
      <ScrollView style={styles.timelineContainer}>
        <View style={styles.timeline}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <TouchableOpacity 
                key={activity.id}
                style={styles.timelineItem}
                onPress={() => {
                  // Navigate to the appropriate screen based on activity type
                  switch(activity.type) {
                    case 'lesson':
                      navigation.navigate('LessonScreen', { activityId: activity.id });
                      break;
                    case 'concept':
                      navigation.navigate('ConceptCheckScreen', { activityId: activity.id });
                      break;
                    case 'practice':
                      navigation.navigate('PracticeActivityScreen', { activityId: activity.id });
                      break;
                    case 'quiz':
                      navigation.navigate('NewQuizScreen', { activityId: activity.id });
                      break;
                    case 'challenge':
                      navigation.navigate('ChallengeScreen', { activityId: activity.id });
                      break;
                    default:
                      // Default fallback
                      navigation.navigate('ModuleDetail', { 
                        moduleId: courseData.modules[activity.moduleIndex - 1].id,
                        moduleTitle: activity.moduleTitle,
                        moduleIndex: activity.moduleIndex
                      });
                  }
                }}
              >
                {/* Timeline dot and line */}
                <View style={styles.timelineIndicator}>
                  <View 
                    style={[
                      styles.timelineDot,
                      { backgroundColor: activity.completed ? accent : '#555555' }
                    ]}
                  >
                    {activity.completed && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  {index < filteredActivities.length - 1 && (
                    <View 
                      style={[
                        styles.timelineLine,
                        { backgroundColor: filteredActivities[index + 1].completed ? accent : '#555555' }
                      ]}
                    />
                  )}
                </View>
                
                {/* Content */}
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineDate}>{formatDate(activity.completedDate)}</Text>
                    <View 
                      style={[
                        styles.activityBadge,
                        { backgroundColor: getActivityColor(activity.type, accent) }
                      ]}
                    >
                      <Text style={styles.activityBadgeText}>
                        {getActivityLabel(activity.type)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.timelineTitle}>{activity.title}</Text>
                  <Text style={styles.timelineModule}>Module {activity.moduleIndex}: {activity.moduleTitle}</Text>
                  
                  {activity.completed ? (
                    <View style={styles.completedInfo}>
                      <Ionicons name="checkmark-circle" size={16} color={accent} style={styles.completedIcon} />
                      <Text style={[styles.completedText, { color: accent }]}>Completed</Text>
                      {activity.score && (
                        <Text style={styles.scoreText}>{activity.score}% Score</Text>
                      )}
                      {activity.xpEarned && (
                        <View style={styles.xpTag}>
                          <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#777777" />
              <Text style={styles.emptyStateText}>No activities match your filter</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getActivityColor = (type, accentColor) => {
  switch(type) {
    case 'lesson': return accentColor;
    case 'concept': return '#9B59B6';
    case 'practice': return '#3498DB';
    case 'quiz': return '#2ECC71';
    case 'challenge': return '#E74C3C';
    default: return '#777777';
  }
};

const getActivityLabel = (type) => {
  switch(type) {
    case 'lesson': return 'Lesson';
    case 'concept': return 'Concept';
    case 'practice': return 'Practice';
    case 'quiz': return 'Quiz';
    case 'challenge': return 'Challenge';
    default: return 'Activity';
  }
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
  shareButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  filterContainer: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444444',
    marginRight: 12,
  },
  activeFilter: {
    backgroundColor: '#2A2A2A',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  timelineContainer: {
    flex: 1,
  },
  timeline: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#555555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#555555',
    marginVertical: 4,
    marginLeft: 11, // (24 - 2) / 2
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  timelineModule: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 12,
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  completedIcon: {
    marginRight: 6,
  },
  completedText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 12,
  },
  xpTag: {
    backgroundColor: '#444444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#777777',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default CourseProgressScreen; 