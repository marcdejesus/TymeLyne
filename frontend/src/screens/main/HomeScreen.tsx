import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from '../../components/dashboard/Dashboard';
import { Goal } from '../../components/goals/GoalCard';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/layout/AppHeader';

// Sample data for dashboard - would be fetched from API in a real app
const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete 1 hour of Coding',
    description: 'Practice coding skills daily to improve programming abilities',
    progress: 0.75,
    priority: 'HIGH',
    dueDate: '2023-12-31',
    tags: ['coding', 'education'],
  },
  {
    id: '2',
    title: 'Read for 30 minutes daily',
    description: 'Read books to expand knowledge and vocabulary',
    progress: 0.4,
    priority: 'MEDIUM',
    dueDate: '2023-12-15',
    tags: ['reading', 'education'],
  },
  {
    id: '3',
    title: 'Exercise 3 times a week',
    description: 'Stay active to maintain good health',
    progress: 0.2,
    priority: 'LOW',
    dueDate: '2023-11-30',
    tags: ['fitness', 'health'],
  },
];

const sampleTasks = [
  {
    id: '1',
    title: 'Complete React Native tutorial',
    completed: true,
    category: 'Coding',
  },
  {
    id: '2',
    title: 'Go for a 30-minute walk',
    completed: false,
    category: 'Fitness',
  },
  {
    id: '3',
    title: 'Read chapter 5 of Design Patterns book',
    completed: false,
    category: 'Reading',
  },
  {
    id: '4',
    title: 'Meditate for 10 minutes',
    completed: true,
    category: 'Wellness',
  },
];

const sampleBadges = [
  {
    id: '1',
    title: 'Early Bird',
    icon: 'sunrise',
    earned: true,
    date: '2023-10-15',
  },
  {
    id: '2',
    title: 'Bookworm',
    icon: 'book',
    earned: true,
    date: '2023-11-05',
  },
  {
    id: '3',
    title: 'Code Master',
    icon: 'code',
    earned: false,
  },
  {
    id: '4',
    title: 'Fitness Warrior',
    icon: 'activity',
    earned: false,
  },
  {
    id: '5',
    title: 'Mindfulness Pro',
    icon: 'heart',
    earned: false,
  },
  {
    id: '6',
    title: 'Water Tracker',
    icon: 'droplet',
    earned: true,
    date: '2023-09-20',
  },
  {
    id: '7',
    title: 'Sleep Champion',
    icon: 'moon',
    earned: false,
  },
  {
    id: '8',
    title: 'Productivity Master',
    icon: 'check-circle',
    earned: false,
  },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [userXp, setUserXp] = useState(750);
  const [userLevel, setUserLevel] = useState(5);
  const [nextLevelXp, setNextLevelXp] = useState(1000);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [goals, setGoals] = useState(sampleGoals);
  const [tasks, setTasks] = useState(sampleTasks);
  const [badges, setBadges] = useState(sampleBadges);

  // Simulate fetching data when the component mounts
  useEffect(() => {
    // In a real app, this would fetch data from an API
    console.log('Fetching dashboard data for user:', profile?.id);
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Update with new data
      setRefreshing(false);
      // Simulate level up on refresh (for demo purposes)
      if (Math.random() > 0.7) {
        setUserLevel(userLevel + 1);
        setShowLevelUp(true);
      }
    }, 1500);
  };

  const handleTaskPress = (taskId: string) => {
    // Toggle task completion status
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    );
    
    // If task was marked as completed, increase XP
    const completedTask = tasks.find(task => task.id === taskId);
    if (completedTask && !completedTask.completed) {
      // Add XP for completing a task
      const newXp = userXp + 25;
      setUserXp(newXp);
      
      // Check for level up
      if (newXp >= nextLevelXp) {
        setUserLevel(userLevel + 1);
        setNextLevelXp(nextLevelXp + 500);
        setShowLevelUp(true);
      }
    }
    
    setTasks(updatedTasks);
  };

  const handleGoalPress = (goal: Goal) => {
    // Navigate to the goals screen
    // @ts-ignore - navigation typing issue
    navigation.navigate('Goals');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Dashboard"
        username={profile?.full_name || 'User'}
        avatarUrl={profile?.avatar_url || undefined}
        userRole={profile?.role || 'USER'}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Dashboard
          userXp={userXp}
          userLevel={userLevel}
          nextLevelXp={nextLevelXp}
          goals={goals}
          tasks={tasks}
          badges={badges}
          onTaskPress={handleTaskPress}
          onGoalPress={handleGoalPress}
          username={profile?.full_name || 'User'}
          avatarUrl={profile?.avatar_url || undefined}
          pageTitle="Dashboard"
          userRole={profile?.role || 'USER'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
}); 