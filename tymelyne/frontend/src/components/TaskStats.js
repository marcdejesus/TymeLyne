import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../context/TaskContext';

/**
 * TaskStats - A component for displaying task statistics
 * Can be used in different screens to show consistent task stats
 */
const TaskStats = ({ minimal = false }) => {
  const { getStats } = useTask();
  const stats = getStats();
  
  // For minimal display (e.g. in headers, smaller components)
  if (minimal) {
    return (
      <View style={styles.minimalContainer}>
        <Text style={styles.minimalStat}>
          <Ionicons name="checkbox" size={14} color="#E67E22" /> {stats.completed}/{stats.total}
        </Text>
      </View>
    );
  }
  
  // Calculate progress percentage
  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  // Full stats display
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Progress</Text>
        <Text style={styles.count}>{stats.completed}/{stats.total}</Text>
      </View>
      
      {/* Non-animated progress bar using absolute positioning */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progressPercent}%` }
          ]} 
        />
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{stats.totalXpEarned}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash" size={20} color="#4CAF50" />
          <Text style={styles.statLabel}>Total Coins</Text>
          <Text style={styles.statValue}>{stats.totalCoinsEarned}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="today" size={20} color="#3498DB" />
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    margin: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    color: '#E67E22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E67E22',
    borderRadius: 5,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  minimalContainer: {
    paddingHorizontal: 10,
  },
  minimalStat: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default TaskStats; 