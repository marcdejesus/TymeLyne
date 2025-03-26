import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, FAB, Checkbox } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/layout/AppHeader';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  dueDate?: string;
}

// Sample tasks for development
const sampleTasks: Task[] = [
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
    dueDate: 'Today',
  },
  {
    id: '3',
    title: 'Read chapter 5 of Design Patterns book',
    completed: false,
    category: 'Reading',
    dueDate: 'Tomorrow',
  },
  {
    id: '4',
    title: 'Meditate for 10 minutes',
    completed: false,
    category: 'Wellness',
  },
  {
    id: '5',
    title: 'Call mom',
    completed: false,
    category: 'Personal',
    dueDate: 'Today',
  },
];

export default function TasksScreen() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          color="#6200ee"
          onPress={() => toggleTaskCompletion(item.id)}
        />
        
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            item.completed && styles.taskCompleted
          ]}>
            {item.title}
          </Text>
          
          <View style={styles.taskDetails}>
            {item.category && (
              <View style={styles.taskCategory}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
            
            {item.dueDate && (
              <View style={styles.taskDueDate}>
                <Icon name="clock" size={12} color="#666" />
                <Text style={styles.dueDateText}>{item.dueDate}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Tasks"
        username={profile?.full_name || 'User'}
        avatarUrl={profile?.avatar_url || undefined}
        userRole={profile?.role || 'USER'}
      />
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => console.log('Add new task')}
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
  listContent: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDetails: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  taskCategory: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6200ee',
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
}); 