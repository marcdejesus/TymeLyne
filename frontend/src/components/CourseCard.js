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
        <View style={styles.gridIconContainer}>
          <Image source={course.icon} style={styles.gridIcon} />
        </View>
        <Typography 
          variant="body2" 
          weight="medium" 
          center 
          numberOfLines={1}
          style={styles.gridTitle}
        >
          {course.title.length > 8 ? course.title.substring(0, 8) + '...' : course.title}
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
          numberOfLines={2}
          style={styles.title}
        >
          {course.title}
        </Typography>
        
        {course.progress !== undefined && (
          <View style={styles.progressContainer}>
            <Typography 
              variant="caption" 
              color={colors.secondary}
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
    width: width * 0.15,
    height: width * 0.15,
    maxWidth: 60,
    maxHeight: 60,
    borderRadius: width * 0.075, // Make it a circle by setting borderRadius to half the width
    backgroundColor: colors.primaryLight, // Light background for the icon that matches the brand color
    overflow: 'hidden', // Ensure the image doesn't bleed outside the circle
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.s,
  },
  title: {
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
    width: '95%', // More space for progress bar
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
    backgroundColor: colors.secondary,
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
    width: '48%',
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    paddingVertical: spacing.m * 1.2,
    borderRadius: borderRadius.l,
    height: 120,
  },
  gridIconContainer: {
    width: width * 0.18,
    height: width * 0.18,
    maxWidth: 70,
    maxHeight: 70,
    borderRadius: width * 0.09,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  gridIcon: {
    width: width * 0.12,
    height: width * 0.12,
    maxWidth: 48,
    maxHeight: 48,
    resizeMode: 'contain',
  },
  gridTitle: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
  },
});

export default CourseCard; 