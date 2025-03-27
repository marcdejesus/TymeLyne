import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * TaskItem - A reusable component for displaying individual tasks
 * @param {Object} task - The task object with properties (id, title, completed, xp, coins)
 * @param {Function} onToggle - Function to call when toggling completion status
 * @param {Function} onDelete - Function to call when deleting the task
 */
const TaskItem = ({ task, onToggle, onDelete }) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Run animation when task completion status changes
  useEffect(() => {
    if (task.completed) {
      // Sequence of animations for completion
      Animated.sequence([
        // 1. Quick scale up
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        // 2. Scale back to normal
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when unchecked
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [task.completed]);

  // Handle task toggling with animation
  const handleToggle = () => {
    // Start a tap animation
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the actual toggle function
    onToggle(task.id);
  };

  return (
    <Animated.View 
      style={[
        styles.taskItem,
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.taskCheckbox}
        onPress={handleToggle}
      >
        <Ionicons 
          name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={task.completed ? "#E67E22" : "#999"}
        />
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle, 
          task.completed && styles.taskCompleted
        ]}>
          {task.title}
        </Text>
        
        <View style={styles.taskRewards}>
          <Text style={styles.taskReward}>
            <Ionicons name="star" size={14} color="#FFD700" /> {task.xp} XP
          </Text>
          <Text style={styles.taskReward}>
            <Ionicons name="cash" size={14} color="#4CAF50" /> {task.coins} coins
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskRewards: {
    flexDirection: 'row',
  },
  taskReward: {
    fontSize: 12,
    color: '#AAA',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
});

export default TaskItem; 