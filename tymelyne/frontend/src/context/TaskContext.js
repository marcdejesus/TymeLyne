import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

/**
 * TaskContext - Provides task state management throughout the app
 */

// Create the context
const TaskContext = createContext();

// Custom hook to use the task context
export const useTask = () => {
  return useContext(TaskContext);
};

// Default tasks for new users
const defaultTasks = [
  { id: '1', title: 'Complete Python basics module', completed: false, xp: 50, coins: 10 },
  { id: '2', title: 'Practice coding for 30 minutes', completed: false, xp: 30, coins: 5 },
  { id: '3', title: 'Review yesterday\'s lessons', completed: false, xp: 20, coins: 3 },
];

// Provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedToday: 0,
    totalXpEarned: 0,
    totalCoinsEarned: 0,
  });
  
  // Get auth context functions
  const { user, login } = useAuth();

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Load saved tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const storedStats = await AsyncStorage.getItem('taskStats');
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        // Initialize with default tasks for new users
        setTasks(defaultTasks);
        await AsyncStorage.setItem('tasks', JSON.stringify(defaultTasks));
      }
      
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.log('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save tasks to AsyncStorage
  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  };

  // Save stats to AsyncStorage
  const saveStats = async (newStats) => {
    try {
      await AsyncStorage.setItem('taskStats', JSON.stringify(newStats));
    } catch (error) {
      console.log('Error saving task stats:', error);
    }
  };

  // Add a new task
  const addTask = async (title) => {
    if (!title.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      xp: Math.floor(Math.random() * 30) + 20, // Random XP between 20-50
      coins: Math.floor(Math.random() * 5) + 3, // Random coins between 3-8
    };
    
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        const newCompletedState = !wasCompleted;
        
        // Update stats if task is being completed (not uncompleted)
        if (!wasCompleted && newCompletedState) {
          const newStats = {
            ...stats,
            completedToday: stats.completedToday + 1,
            totalXpEarned: stats.totalXpEarned + task.xp,
            totalCoinsEarned: stats.totalCoinsEarned + task.coins,
          };
          setStats(newStats);
          saveStats(newStats);
          
          // Update user XP and coins in AuthContext
          if (user) {
            const updatedUser = {
              ...user,
              xp: (user.xp || 0) + task.xp,
              coins: (user.coins || 0) + task.coins,
            };
            
            // Save updated user data
            login(updatedUser);
          }
        }
        
        return { ...task, completed: newCompletedState };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  // Delete a task
  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  // Reset daily tasks at midnight
  const resetDailyTasks = async () => {
    // This would typically be called from a background job or when app opens after a day
    setStats({
      ...stats,
      completedToday: 0,
    });
    
    // Mark all tasks as not completed
    const resetTasks = tasks.map(task => ({
      ...task,
      completed: false,
    }));
    
    setTasks(resetTasks);
    await saveTasks(resetTasks);
    await saveStats({
      ...stats,
      completedToday: 0,
    });
  };

  // Get all task stats
  const getStats = () => {
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      ...stats
    };
  };

  // Context value
  const value = {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    getStats,
    resetDailyTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext; 