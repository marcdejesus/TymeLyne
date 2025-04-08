import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * AchievementCard - Tappable card showing an achievement with icon and title
 * 
 * @param {Object} achievement - Achievement data object
 * @param {Boolean} completed - Whether the achievement has been completed
 * @param {Function} onPress - Function to call when card is pressed
 */
const AchievementCard = ({ achievement, completed = false, onPress }) => {
  const { accent, current } = useTheme();
  
  // Determine icon name (with fallback)
  const iconName = achievement.icon || 'trophy';
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(achievement)}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.card, 
          { 
            backgroundColor: completed ? accent + '10' : current.cardSecondary,
            borderColor: completed ? accent + '40' : 'transparent',
          }
        ]}
      >
        {/* Icon */}
        <View 
          style={[
            styles.iconContainer, 
            { 
              backgroundColor: completed ? accent : current.border,
              opacity: completed ? 1 : 0.6 
            }
          ]}
        >
          <Ionicons 
            name={iconName} 
            size={22} 
            color={completed ? 'white' : current.textSecondary} 
          />
        </View>
        
        {/* Title */}
        <Text 
          style={[
            styles.title,
            { color: completed ? current.text : current.textSecondary }
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {achievement.name}
        </Text>
        
        {/* Completed Badge */}
        {completed && (
          <View style={[styles.completedBadge, { backgroundColor: accent }]}>
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '33.33%',
    padding: 6,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AchievementCard; 