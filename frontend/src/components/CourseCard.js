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
        activeOpacity={0.8}
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
      activeOpacity={0.8}
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
        >
          <Text style={styles.optionsDots}>•••</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Horizontal card styles
  card: {
    backgroundColor: '#F4ECE1',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    width: width * 0.12,
    height: width * 0.12,
    maxWidth: 50,
    maxHeight: 50,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
    width: '85%', // Avoid overlap with options dots
  },
  progressText: {
    fontSize: Math.min(12, width * 0.03),
    color: '#6B6B5A',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0D8C0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#D35C34',
    borderRadius: 4,
  },
  optionsButton: {
    padding: 4,
    justifyContent: 'flex-start',
  },
  optionsDots: {
    fontSize: 18,
    color: '#6B6B5A',
    lineHeight: 18,
  },
  
  // Grid card styles
  gridCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    backgroundColor: '#F4ECE1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gridIcon: {
    width: width * 0.1,
    height: width * 0.1,
    maxWidth: 40,
    maxHeight: 40,
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
    textAlign: 'center',
    color: '#4A4A3A',
  },
});

export default CourseCard; 