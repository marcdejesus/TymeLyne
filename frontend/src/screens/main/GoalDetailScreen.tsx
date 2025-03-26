import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { IconButton, ProgressBar, Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { Goal } from '../../components/goals/GoalCard';
import { useAuth } from '../../hooks/useAuth';
import AppHeader from '../../components/layout/AppHeader';
import Toast from 'react-native-toast-message';

// Types for the roadmap sections
interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  position: number;
  units: RoadmapUnit[];
}

interface RoadmapUnit {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  position: number;
  xp: number;
}

// Generate mock roadmap sections for a goal
const generateRoadmapSections = (goal: Goal): RoadmapSection[] => {
  // For a real app, this would come from an API
  const numSections = Math.floor(Math.random() * 4) + 3; // 3-6 sections

  return Array.from({ length: numSections }).map((_, i) => {
    const numUnits = Math.floor(Math.random() * 3) + 2; // 2-4 units per section
    
    const sectionStatus = 
      i === 0 ? 'completed' :
      i <= Math.ceil(goal.progress * numSections) ? 'available' : 'locked';
    
    return {
      id: `section-${goal.id}-${i}`,
      title: `Section ${i + 1}`,
      description: `${goal.title} - Learning phase ${i + 1}`,
      status: sectionStatus,
      position: i,
      units: Array.from({ length: numUnits }).map((_, j) => {
        const unitPosition = i * 10 + j;
        const unitStatus = 
          unitPosition < goal.progress * (numSections * 10) ? 'completed' :
          unitPosition === Math.floor(goal.progress * (numSections * 10)) ? 'available' : 'locked';
        
        return {
          id: `unit-${goal.id}-${i}-${j}`,
          title: `Unit ${j + 1}`,
          description: `Practice exercise ${j + 1} for ${goal.title}`,
          status: unitStatus,
          position: unitPosition,
          xp: Math.floor(Math.random() * 15) + 5 // 5-20 XP
        };
      })
    };
  });
};

export default function GoalDetailScreen() {
  const route = useRoute<RouteProp<{ params: { goal: Goal } }, 'params'>>();
  const navigation = useNavigation();
  const { profile } = useAuth();
  
  const [goal, setGoal] = useState<Goal>(route.params?.goal);
  const [roadmapSections, setRoadmapSections] = useState<RoadmapSection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize roadmap when component mounts
  useEffect(() => {
    if (goal) {
      // Simulate API delay
      setTimeout(() => {
        setRoadmapSections(generateRoadmapSections(goal));
        setLoading(false);
      }, 800);
    }
  }, [goal]);

  // Get priority color for UI elements
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#e53935'; // Red
      case 'MEDIUM':
        return '#fb8c00'; // Orange
      case 'LOW':
        return '#43a047'; // Green
      default:
        return '#6200ee'; // Purple
    }
  };

  const handleUnitPress = (section: RoadmapSection, unit: RoadmapUnit) => {
    if (unit.status === 'locked') {
      Toast.show({
        type: 'info',
        text1: 'Unit Locked',
        text2: 'Complete previous units to unlock this one'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: `Starting ${unit.title}`,
      text2: `${unit.description} - ${unit.xp} XP`
    });

    // In a real app, this would navigate to the unit screen or start the exercise
    console.log('Starting unit:', unit);
  };

  const renderStatusIcon = (status: 'locked' | 'available' | 'completed') => {
    switch (status) {
      case 'completed':
        return <Icon name="check-circle" size={24} color="#43a047" />;
      case 'available':
        return <Icon name="circle" size={24} color="#fb8c00" />;
      case 'locked':
        return <Icon name="lock" size={24} color="#9e9e9e" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Preparing your goal journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={goal?.title || 'Goal Details'}
        showBack={true}
        showSettings={false}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Goal Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{goal.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
                <Text style={styles.priorityText}>{goal.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{goal.description}</Text>
            
            {goal.dueDate && (
              <View style={styles.dueDate}>
                <Icon name="calendar" size={16} color="#666" />
                <Text style={styles.dueDateText}>{goal.dueDate}</Text>
              </View>
            )}
            
            {goal.tags && goal.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {goal.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{Math.round(goal.progress * 100)}% Complete</Text>
              <ProgressBar 
                progress={goal.progress} 
                color={getPriorityColor(goal.priority)} 
                style={styles.progressBar} 
              />
            </View>
          </Card.Content>
        </Card>
        
        {/* Roadmap */}
        <View style={styles.roadmapContainer}>
          <Text style={styles.roadmapTitle}>Your Learning Roadmap</Text>
          <Text style={styles.roadmapSubtitle}>Complete sections to reach your goal</Text>
          
          {roadmapSections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                {renderStatusIcon(section.status)}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              <Text style={styles.sectionDescription}>{section.description}</Text>
              
              <View style={styles.unitsContainer}>
                {section.units.map((unit, unitIndex) => (
                  <TouchableOpacity 
                    key={unit.id} 
                    style={[
                      styles.unitButton,
                      { 
                        opacity: unit.status === 'locked' ? 0.6 : 1,
                        backgroundColor: unit.status === 'completed' 
                          ? '#e8f5e9' // Light green
                          : unit.status === 'available' 
                            ? '#fff3e0' // Light orange
                            : '#f5f5f5' // Light grey
                      }
                    ]}
                    onPress={() => handleUnitPress(section, unit)}
                    disabled={unit.status === 'locked'}
                  >
                    <View style={styles.unitContent}>
                      <View style={styles.unitHeader}>
                        <Text style={styles.unitTitle}>{unit.title}</Text>
                        {renderStatusIcon(unit.status)}
                      </View>
                      <Text style={styles.unitDescription} numberOfLines={2}>
                        {unit.description}
                      </Text>
                      <View style={styles.unitFooter}>
                        <View style={styles.xpBadge}>
                          <Icon name="award" size={14} color="#6200ee" />
                          <Text style={styles.xpText}>{unit.xp} XP</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  summaryCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  roadmapContainer: {
    padding: 16,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roadmapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  unitsContainer: {
    gap: 12,
  },
  unitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitContent: {
    padding: 12,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 4,
  },
}); 