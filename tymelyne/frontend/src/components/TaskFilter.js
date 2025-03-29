import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * TaskFilter - Component for filtering tasks by completion status
 * @param {string} currentFilter - Current active filter ('all', 'active', or 'completed')
 * @param {Function} onFilterChange - Function called when filter is changed
 * @param {Object} counts - Object containing counts for different task statuses
 */
const TaskFilter = ({ currentFilter, onFilterChange, counts }) => {
  // Get accent color from theme context
  const { accent } = useTheme();
  
  // Define available filters
  const filters = [
    { id: 'all', label: 'All', icon: 'list', count: counts?.all || 0 },
    { id: 'active', label: 'Active', icon: 'ellipsis-horizontal-circle', count: counts?.active || 0 },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle', count: counts?.completed || 0 },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterOption,
            currentFilter === filter.id && [styles.activeFilter, { backgroundColor: accent }],
          ]}
          onPress={() => onFilterChange(filter.id)}
        >
          <Ionicons 
            name={filter.icon} 
            size={16} 
            color={currentFilter === filter.id ? '#FFF' : '#AAA'} 
          />
          <Text style={[
            styles.filterText,
            currentFilter === filter.id && styles.activeFilterText,
          ]}>
            {filter.label}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filter.count}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 25,
    padding: 4,
    marginBottom: 15,
  },
  filterOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  activeFilter: {
    // backgroundColor will be applied dynamically from accent color
  },
  filterText: {
    color: '#AAA',
    fontSize: 14,
    marginLeft: 4,
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
  },
});

export default TaskFilter; 