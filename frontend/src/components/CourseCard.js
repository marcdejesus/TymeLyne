import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, borderRadius } from '../constants/theme';
import Typography from './Typography';
import Card from './Card';

const { width } = Dimensions.get('window');

/**
 * Reusable component for displaying course information in a card
 * 
 * @param {object} course - Course object containing id, title, icon, progress (optional)
 * @param {function} onPress - Function to call when the card is pressed
 * @param {function} onOptionsPress - Function to call when options button is pressed (if null, no options shown)
 * @param {string} variant - Card variant: 'horizontal' (default) or 'grid'
 * @param {object} style - Additional styles for the card container
 */
const CourseCard = ({
  course,
  onPress,
  onOptionsPress,
  variant = 'horizontal',
  style
}) => {
  // For grid layout style
  if (variant === 'grid') {
    return (
      <Card 
        variant="elevated"
        style={[styles.gridCard, style]}
        onPress={onPress}
        noPadding={false}
      >
        <Image source={course.icon} style={styles.gridIcon} />
        <Typography 
          variant="subheading" 
          weight="semiBold" 
          center 
          numberOfLines={2}
          style={styles.gridTitle}
        >
          {course.title}
        </Typography>
      </Card>
    );
  }
  
  // For horizontal layout (default)
  return (
    <Card 
      variant="elevated"
      style={[styles.card, style]}
      onPress={onPress}
      noPadding={false}
    >
      <View style={styles.iconContainer}>
        <Image source={course.icon} style={styles.icon} />
      </View>
      
      <View style={styles.contentContainer}>
        <Typography 
          variant="subheading" 
          weight="semiBold" 
          numberOfLines={1}
          style={styles.title}
        >
          {course.title}
        </Typography>
        
        {course.progress !== undefined && (
          <View style={styles.progressContainer}>
            <Typography 
              variant="caption" 
              color={colors.text.secondary}
              style={styles.progressText}
            >
              {course.progress}% COMPLETE
            </Typography>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progress, 
                  { width: `${course.progress}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      {onOptionsPress && (
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={onOptionsPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  // Horizontal card styles
  card: {
    padding: 0, // Card component has its own padding
    flexDirection: 'row',
    marginBottom: spacing.m,
    borderRadius: borderRadius.m,
    padding: spacing.m,
  },
  iconContainer: {
    marginRight: spacing.m,
    justifyContent: 'center',
  },
  icon: {
    width: width * 0.12,
    height: width * 0.12,
    maxWidth: 50,
    maxHeight: 50,
    borderRadius: width * 0.06, // Make it a circle by setting borderRadius to half the width
    backgroundColor: colors.border, // Light background for the icon
    padding: spacing.xs, // Add some padding inside the circle
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure the image doesn't bleed outside the circle
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
    width: '90%', // Avoid overlap with options dots
  },
  progressText: {
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  optionsButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  
  // Grid card styles
  gridCard: {
    width: '46%',
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    padding: spacing.m,
  },
  gridIcon: {
    width: width * 0.1,
    height: width * 0.1,
    maxWidth: 40,
    maxHeight: 40,
    borderRadius: width * 0.05, // Make it a circle by setting borderRadius to half the width
    backgroundColor: colors.border, // Light background for the icon
    padding: spacing.xs, // Add some padding inside the circle
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure the image doesn't bleed outside the circle
    marginBottom: spacing.s,
  },
  gridTitle: {
    textAlign: 'center',
  },
});

export default CourseCard; 