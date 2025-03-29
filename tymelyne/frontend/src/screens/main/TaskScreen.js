import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from '../../components/TaskItem';
import TaskStats from '../../components/TaskStats';
import RewardPopup from '../../components/RewardPopup';
import TaskFilter from '../../components/TaskFilter';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * TaskScreen - Screen for managing and tracking daily tasks
 */
const TaskScreen = ({ navigation }) => {
  // Get user data from auth context
  const { user } = useAuth();
  
  // Get accent color from theme context
  const { accent } = useTheme();
  
  // Get tasks and task functions from task context
  const { 
    tasks, 
    loading,
    addTask, 
    toggleTask, 
    deleteTask 
  } = useTask();
  
  // State for new task input
  const [newTask, setNewTask] = useState('');
  
  // State for task filtering
  const [filter, setFilter] = useState('all');
  
  // State for reward popup
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  
  // Filter tasks based on current filter
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);
  
  // Calculate counts for task filter
  const filterCounts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
  }), [tasks]);
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    addTask(newTask);
    setNewTask('');
  };

  // Enhanced toggle task function to show rewards
  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Only show reward if completing (not uncompleting)
    if (task && !task.completed) {
      setCurrentReward({
        xp: task.xp,
        coins: task.coins
      });
      setShowReward(true);
    }
    
    // Call the original toggle function
    toggleTask(taskId);
  };
  
  // Hide reward popup when animation completes
  const handleRewardAnimationComplete = () => {
    setShowReward(false);
    setCurrentReward(null);
  };

  // Render a task item using the TaskItem component
  const renderTaskItem = ({ item }) => (
    <TaskItem 
      task={item} 
      onToggle={handleToggleTask}
      onDelete={deleteTask}
    />
  );

  // Show loading indicator while fetching tasks
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Reward popup */}
      <RewardPopup 
        visible={showReward}
        reward={currentReward}
        onAnimationComplete={handleRewardAnimationComplete}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" /> {user?.xp || 0} XP
          </Text>
          <Text style={styles.statItem}>
            <Ionicons name="cash" size={16} color="#4CAF50" /> {user?.coins || 0} coins
          </Text>
        </View>
      </View>
      
      {/* Task Stats Component */}
      <TaskStats />
      
      <View style={styles.addTaskContainer}>
        <TextInput
          style={styles.taskInput}
          placeholder="Add a new task..."
          placeholderTextColor="#999"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity 
          style={[
            styles.addButton, 
            { backgroundColor: accent },
            !newTask.trim() && styles.addButtonDisabled
          ]}
          onPress={handleAddTask}
          disabled={!newTask.trim()}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>Your Tasks</Text>
        <Text style={styles.taskCount}>{filteredTasks.length} tasks</Text>
      </View>
      
      {/* Task Filter Component */}
      <View style={styles.filterContainer}>
        <TaskFilter 
          currentFilter={filter}
          onFilterChange={setFilter}
          counts={filterCounts}
        />
      </View>
      
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.tasksList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={60} color="#777" />
            <Text style={styles.emptyText}>
              {filter === 'all' && "No tasks yet"}
              {filter === 'active' && "No active tasks"}
              {filter === 'completed' && "No completed tasks"}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' && "Add tasks to earn XP and coins"}
              {filter === 'active' && "Complete some tasks to see them here"}
              {filter === 'completed' && "Complete some tasks to see them here"}
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    color: '#FFF',
    marginLeft: 15,
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#666',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  taskCount: {
    color: '#999',
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  tasksList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
});

export default TaskScreen; 