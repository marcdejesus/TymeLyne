import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { taskAPI } from '../api/api';

/**
 * TaskList component - displays a list of tasks from the API
 */
const TaskList = () => {
  // State for tasks data
  const [tasks, setTasks] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * Fetch tasks from the API
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
      console.error('Error in fetchTasks:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle task completion status
   * @param {Object} task - The task to toggle
   */
  const toggleTaskCompletion = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await taskAPI.updateTask(task.id, updatedTask);
      
      // Update local state
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error in toggleTaskCompletion:', err);
    }
  };

  /**
   * Render a single task item
   */
  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => toggleTaskCompletion(item)}
    >
      <View style={styles.taskContent}>
        <Text 
          style={[
            styles.taskTitle, 
            item.completed && styles.completedTaskTitle
          ]}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.taskDescription}>{item.description}</Text>
        ) : null}
      </View>
      <View style={[
        styles.taskStatus,
        item.completed ? styles.completedStatus : styles.pendingStatus
      ]} />
    </TouchableOpacity>
  );

  // If loading, show activity indicator
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If no tasks, show message
  if (tasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noTasksText}>No tasks found</Text>
      </View>
    );
  }

  // Render task list
  return (
    <FlatList
      data={tasks}
      renderItem={renderTaskItem}
      keyExtractor={item => item.id.toString()}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    />
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  completedStatus: {
    backgroundColor: '#4caf50',
  },
  pendingStatus: {
    backgroundColor: '#ff9800',
    borderWidth: 1,
    borderColor: '#f57c00',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noTasksText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TaskList; 