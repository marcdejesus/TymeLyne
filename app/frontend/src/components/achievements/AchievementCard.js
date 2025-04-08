import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * AchievementCard - Displays a single achievement in a grid
 * 
 * @param {Object} achievement - The achievement data
 * @param {Function} onPress - Function to call when pressed
 * @param {Boolean} completed - Whether this achievement has been earned
 */
const AchievementCard = ({ achievement, onPress, completed = false }) => {
  const { accent, current } = useTheme();
  
  // Default icon if none provided
  const iconName = achievement?.icon || 'trophy';
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: current.card }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { 
          backgroundColor: completed ? `${accent}40` : '#44444440',
          borderColor: completed ? accent : '#666666'
        }
      ]}>
        <Ionicons 
          name={iconName} 
          size={32} 
          color={completed ? accent : '#888888'} 
        />
      </View>
      
      <Text 
        style={[
          styles.title,
          { color: current.text }
        ]}
        numberOfLines={2}
      >
        {achievement?.name || 'Achievement'}
      </Text>
      
      {completed && (
        <View style={[styles.completedBadge, { backgroundColor: accent }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AchievementCard; 