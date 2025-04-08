import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { taskAPI } from '../api/api';

/**
 * TaskForm component - allows users to add new tasks
 * @param {Object} props - Component props
 * @param {Function} props.onTaskAdded - Callback when a task is added
 */
const TaskForm = ({ onTaskAdded }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Validate input
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create new task via API
      const newTask = {
        title: title.trim(),
        description: description.trim(),
        completed: false
      };
      
      const createdTask = await taskAPI.createTask(newTask);
      
      // Clear form
      setTitle('');
      setDescription('');
      
      // Notify parent
      if (onTaskAdded) {
        onTaskAdded(createdTask);
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Error',
        'Failed to add task. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Task</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
        editable={!isSubmitting}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        editable={!isSubmitting}
      />
      
      <TouchableOpacity 
        style={[
          styles.button,
          isSubmitting && styles.disabledButton
        ]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Add Task</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  disabledButton: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TaskForm; 