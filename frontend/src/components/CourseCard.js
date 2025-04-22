import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

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
      <TouchableOpacity 
        style={[styles.gridCard, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={course.icon} style={styles.gridIcon} />
        <Text style={styles.gridTitle} numberOfLines={2}>
          {course.title}
        </Text>
      </TouchableOpacity>
    );
  }
  
  // For horizontal layout (default)
  return (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image source={course.icon} style={styles.icon} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {course.title}
        </Text>
        
        {course.progress !== undefined && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {course.progress}% COMPLETE
            </Text>
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
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Horizontal card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  icon: {
    width: width * 0.12,
    height: width * 0.12,
    maxWidth: 50,
    maxHeight: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
    width: '90%', // Avoid overlap with options dots
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
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
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  
  // Grid card styles
  gridCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  gridIcon: {
    width: width * 0.1,
    height: width * 0.1,
    maxWidth: 40,
    maxHeight: 40,
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
});

export default CourseCard; 