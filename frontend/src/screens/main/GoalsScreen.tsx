import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, SafeAreaView, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import { FAB, Portal, Button, Card, Paragraph, Title, Chip, Avatar, Surface } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import Toast from 'react-native-toast-message';
import GoalCard, { Goal } from '../../components/goals/GoalCard';
import GoalCreationForm from '../../components/goals/GoalCreationForm';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/GoalsNavigator';
import { useTheme } from '../../contexts/ThemeContext';

// Theme options from ProfileThemeSelector
const themes = {
  purple: {
    primaryColor: '#6200ee',
    secondaryColor: '#9c27b0',
    accentColor: '#f5a623',
    backgroundColor: '#f8f8f8',
    cardColor: '#ffffff',
    streakColor: '#f5a623',
    headerColor: '#1f2937'
  },
  blue: {
    primaryColor: '#1976d2',
    secondaryColor: '#0d47a1',
    accentColor: '#64b5f6',
    backgroundColor: '#f5f9ff',
    cardColor: '#ffffff',
    streakColor: '#64b5f6',
    headerColor: '#0d3b66'
  },
  green: {
    primaryColor: '#43a047',
    secondaryColor: '#2e7d32',
    accentColor: '#81c784',
    backgroundColor: '#f5fff9',
    cardColor: '#ffffff',
    streakColor: '#81c784',
    headerColor: '#1e3d2a'
  },
  orange: {
    primaryColor: '#fb8c00',
    secondaryColor: '#ef6c00',
    accentColor: '#ffb74d',
    backgroundColor: '#fff9f5',
    cardColor: '#ffffff',
    streakColor: '#ffb74d',
    headerColor: '#663d00'
  },
  pink: {
    primaryColor: '#ec407a',
    secondaryColor: '#d81b60',
    accentColor: '#f48fb1',
    backgroundColor: '#fff5f9',
    cardColor: '#ffffff',
    streakColor: '#f48fb1',
    headerColor: '#5e0a30'
  },
  dark: {
    primaryColor: '#424242',
    secondaryColor: '#212121',
    accentColor: '#757575',
    backgroundColor: '#121212',
    cardColor: '#1e1e1e',
    streakColor: '#757575',
    headerColor: '#000000'
  }
};

// Suggested goals for the creation form
const suggestedGoals = [
  {
    id: '1',
    title: 'Be physically active',
    description: 'Engage in physical activities regularly to improve health and fitness',
    category: 'Health',
    icon: 'activity',
  },
  {
    id: '2',
    title: 'Get better sleep',
    description: 'Improve sleep quality and duration for better health',
    category: 'Health',
    icon: 'moon',
  },
  {
    id: '3',
    title: 'Develop a consistent study routine',
    description: 'Create and maintain a regular study schedule',
    category: 'Education',
    icon: 'book',
  },
  {
    id: '4',
    title: 'Reduce screentime',
    description: 'Limit the time spent on electronic devices',
    category: 'Productivity',
    icon: 'smartphone',
  },
  {
    id: '5',
    title: 'Strengthen family ties',
    description: 'Dedicate more time to family activities and communications',
    category: 'Relationships',
    icon: 'heart',
  },
];

// Sample goals for development - would be fetched from API in a real scenario
const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Full-Stack Engineer',
    description: 'Boost your skills with key concepts you haven\'t mastered yet or need extra attention on.',
    progress: 0.75,
    priority: 'HIGH',
    dueDate: '2023-12-31',
    tags: ['coding', 'education'],
  },
  {
    id: '2',
    title: 'Spanish Fluency',
    description: 'Learn Spanish to conversational level through daily practice and structured lessons',
    progress: 0.4,
    priority: 'MEDIUM',
    dueDate: '2023-12-15',
    tags: ['language', 'education'],
  },
  {
    id: '3',
    title: 'Fitness Challenge',
    description: 'Build a sustainable exercise routine to improve strength and endurance',
    progress: 0.2,
    priority: 'LOW',
    dueDate: '2023-11-30',
    tags: ['fitness', 'health'],
  },
];

// Category icons for visual enhancement
const categoryIcons = {
  'coding': 'code',
  'education': 'book-open',
  'fitness': 'activity',
  'health': 'heart',
  'language': 'globe',
  'productivity': 'clock',
  'relationships': 'users',
};

const { width: screenWidth } = Dimensions.get('window');

// Weekly tracker data
const weekDays = [
  { day: 'Su', completed: false, current: false },
  { day: 'Mo', completed: true, current: true },
  { day: 'Tu', completed: false, current: false },
  { day: 'We', completed: false, current: false },
  { day: 'Th', completed: false, current: false },
  { day: 'Fr', completed: false, current: false },
  { day: 'Sa', completed: false, current: false },
];

// Practice items data
const practiceItems = [
  {
    id: '1',
    title: 'FLASHCARDS',
    duration: '2 min',
    progress: 0.25,
  },
  {
    id: '2',
    title: 'SMART PRACTICE',
    duration: '5 min',
    progress: 0.1,
  },
  {
    id: '3',
    title: 'CODE CHALLENGES',
    duration: '10 min',
    progress: 0.0,
  },
];

// Define theme keys type
type ThemeKey = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'dark';

// Update the interface for user profile to include theme
interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  streakColor: string;
  headerColor: string;
}

// We'll keep the types for local use
type LocalThemeKey = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'dark';

export default function GoalsScreen() {
  const { user, profile } = useAuth();
  const { theme } = useTheme(); // Use the global theme
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeGoal, setActiveGoal] = useState(goals[0]);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<NativeStackNavigationProp<GoalsStackParamList>>();

  // Fetch goals when the component mounts
  useEffect(() => {
    // In a real app, this would fetch goals from an API
    // For now, we're using sample data
    console.log('Fetching goals for user:', user?.id);
  }, [user]);

  useEffect(() => {
    console.log('Goals screen mounted');
    console.log('Goals data:', goals);
  }, []);

  const handleAddGoal = (goal: Partial<Goal>) => {
    // In a real app, this would send data to an API
    const newGoal: Goal = {
      id: Date.now().toString(), // Generate a temporary ID
      title: goal.title || 'Untitled Goal',
      description: goal.description || '',
      progress: 0,
      priority: goal.priority || 'MEDIUM',
      dueDate: goal.dueDate,
      tags: goal.tags,
    };

    setGoals([...goals, newGoal]);
    setShowGoalForm(false);
    
    Toast.show({
      type: 'success',
      text1: 'Goal created',
      text2: 'Your new goal has been added successfully'
    });
  };

  const handleEditGoal = (goal: Partial<Goal>) => {
    // In a real app, this would update data via an API
    if (editingGoal) {
      const updatedGoals = goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...goal } 
          : g
      );
      
      setGoals(updatedGoals);
      setEditingGoal(null);
      setShowGoalForm(false);
      
      Toast.show({
        type: 'success',
        text1: 'Goal updated',
        text2: 'Your goal has been updated successfully'
      });
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    // In a real app, this would delete data via an API
    setGoals(goals.filter(goal => goal.id !== goalId));
    
    Toast.show({
      type: 'success',
      text1: 'Goal deleted',
      text2: 'Your goal has been removed successfully'
    });
  };

  const handleGoalPress = (goal: Goal) => {
    // Navigate to the goal detail screen
    navigation.navigate('GoalDetail', { goal });
  };

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

  const renderGoalCarouselItem = ({ item, index }: { item: Goal, index: number }) => {
    const primaryTag = item.tags && item.tags.length > 0 ? item.tags[0] : 'education';
    const iconName = categoryIcons[primaryTag as keyof typeof categoryIcons] || 'target';
    const priorityColor = getPriorityColor(item.priority);
    
    // Filter practice items for this goal (in a real app, this would be goal-specific)
    const goalPracticeItems = practiceItems.map(practice => ({
      ...practice,
      // Randomly vary progress for different goals to show variety
      progress: index === 0 ? practice.progress : Math.min(Math.random() * 0.5, 1)
    }));
    
    return (
      <View style={styles.goalCardContainer}>
        {/* Career path card */}
        <TouchableOpacity 
          style={[styles.careerPathContainer, { backgroundColor: theme.primaryColor }]}
          onPress={() => navigation.navigate('GoalDetail', { goal: item })}
        >
          <View style={styles.careerPathContent}>
            <Text style={styles.careerPathLabel}>CAREER PATH</Text>
            <Text style={styles.careerPathTitle}>{item.title}</Text>
          </View>
          <Icon name="chevron-right" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Practice pack card */}
        <View style={[styles.mainContent, { backgroundColor: theme.cardColor }]}>
          <View style={styles.practicePackHeader}>
            <Text style={[styles.practicePackTitle, { color: theme.primaryColor }]}>Core practice pack</Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityBadgeText}>{item.priority}</Text>
            </View>
          </View>
          
          <Text style={styles.practicePackDescription}>
            {item.description}
          </Text>

          {goalPracticeItems.map((practice, i) => (
            <TouchableOpacity 
              key={practice.id}
              style={styles.practiceItemContainer}
              onPress={() => navigation.navigate('GoalDetail', { goal: item })}
            >
              <View style={styles.practiceProgress}>
                <View style={styles.progressCircle}>
                  <View style={[styles.progressFill, { 
                    width: `${practice.progress * 100}%`,
                    height: `${practice.progress * 100}%`,
                    backgroundColor: theme.primaryColor
                  }]} />
                </View>
              </View>
              <View style={styles.practiceContent}>
                <Text style={[styles.practiceTitle, { color: theme.secondaryColor }]}>{practice.title}</Text>
                <Text style={styles.practiceDuration}>{practice.duration}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index);
      setActiveGoal(goals[viewableItems[0].index]);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="target" size={64} color="#e0e0e0" />
      <Text style={styles.emptyTitle}>No Goals Yet</Text>
      <Text style={styles.emptyText}>
        Tap the button below to create your first goal and start tracking your progress
      </Text>
      <Button 
        mode="contained" 
        onPress={() => setShowGoalForm(true)}
        style={styles.createButton}
        buttonColor="#6200ee"
      >
        Create Your First Goal
      </Button>
    </View>
  );

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {goals.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide ? styles.paginationDotActive : null
            ]}
          />
        ))}
      </View>
    );
  };

  const renderCarousel = () => {
    if (!goals || goals.length === 0) {
      return renderEmptyState();
    }

    try {
      return (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={goals}
            renderItem={renderGoalCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 20}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.goalFlatListContent}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            keyExtractor={(item) => item.id}
          />
          {renderPagination()}
        </View>
      );
    } catch (error) {
      console.error('Error rendering carousel:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading goals carousel</Text>
          <Button 
            mode="contained" 
            onPress={() => setShowGoalForm(true)}
            style={styles.createButton}
          >
            Create Goal Instead
          </Button>
        </View>
      );
    }
  };

  const renderWeeklyStreak = () => {
    return (
      <Surface style={[styles.weeklyStreakContainer, { backgroundColor: theme.headerColor }]}>
        <View style={styles.daysContainer}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayText}>{day.day}</Text>
              <View style={[
                styles.dayIndicator, 
                { backgroundColor: day.completed ? 'transparent' : theme.headerColor === '#000000' ? '#333' : '#3a4757' },
                day.current ? { borderColor: theme.streakColor, borderWidth: 2 } : null
              ]}>
                {day.completed ? (
                  <View style={styles.flameContainer}>
                    <MaterialIcons name="local-fire-department" size={24} color={theme.streakColor} />
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakText}>
            Great start! Keep your <Text style={[styles.perfectStreak, { color: theme.streakColor }]}>perfect streak</Text> going tomorrow.
          </Text>
        </View>
      </Surface>
    );
  };

  const renderPracticeItem = (item: any) => {
    return (
      <TouchableOpacity 
        style={styles.practiceItemContainer}
        onPress={() => navigation.navigate('GoalDetail', { goal: activeGoal })}
      >
        <View style={styles.practiceProgress}>
          <View style={styles.progressCircle}>
            <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
          </View>
        </View>
        <View style={styles.practiceContent}>
          <Text style={styles.practiceTitle}>{item.title}</Text>
          <Text style={styles.practiceDuration}>{item.duration}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <AppHeader
        title="Goals"
        username={profile?.full_name || 'User'}
        avatarUrl={profile?.avatar_url || undefined}
        userRole={profile?.role || 'USER'}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {renderWeeklyStreak()}

        {/* Goal Carousel */}
        {goals.length > 0 ? (
          <View style={styles.goalCarouselContainer}>
            <FlatList
              ref={flatListRef}
              data={goals}
              renderItem={renderGoalCarouselItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth - 20}
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={styles.goalFlatListContent}
              onViewableItemsChanged={onViewableItemsChanged.current}
              viewabilityConfig={viewabilityConfig.current}
              keyExtractor={(item) => item.id}
            />
            {renderPagination()}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
  
      <Portal>
        <Modal
          visible={showGoalForm}
          animationType="slide"
          onRequestClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <GoalCreationForm
              onSubmit={editingGoal ? handleEditGoal : handleAddGoal}
              onCancel={() => {
                setShowGoalForm(false);
                setEditingGoal(null);
              }}
              suggestedGoals={suggestedGoals}
              isAdvancedMode={isAdvancedMode}
            />
          </SafeAreaView>
        </Modal>
      </Portal>

      <FAB
        style={[styles.fab, { backgroundColor: theme.primaryColor }]}
        icon="plus"
        onPress={() => {
          setEditingGoal(null);
          setShowGoalForm(true);
        }}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  weeklyStreakContainer: {
    backgroundColor: '#1f2937',
    padding: 16,
    margin: 10,
    borderRadius: 16,
    elevation: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3a4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCompleted: {
    backgroundColor: 'transparent',
  },
  dayCurrent: {
    borderWidth: 2,
    borderColor: '#f5a623',
  },
  streakTextContainer: {
    paddingHorizontal: 10,
  },
  streakText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  perfectStreak: {
    color: '#f5a623',
    fontWeight: 'bold',
  },
  careerPathContainer: {
    backgroundColor: '#192440',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  careerPathContent: {
    flex: 1,
  },
  careerPathLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  careerPathTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    elevation: 4,
    marginBottom: 20,
  },
  practicePackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  practicePackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 10,
  },
  priorityBadge: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  priorityBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  practicePackDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  practiceItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  practiceProgress: {
    marginRight: 16,
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#58cc02',
    height: '100%',
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  practiceDuration: {
    fontSize: 14,
    color: '#666',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 16,
    backgroundColor: '#6200ee',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    alignItems: 'center',
    marginBottom: 24,
    height: 380,
  },
  goalCardContainer: {
    width: screenWidth - 20,
    paddingHorizontal: 10,
  },
  goalCarouselContainer: {
    marginBottom: 24,
  },
  goalFlatListContent: {
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#e53935',
    marginBottom: 16,
  },
}); 