import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Reusable progress bar component
 * 
 * @param {number} progress - Progress value (0-100)
 * @param {boolean} showPercentage - Whether to show percentage text
 * @param {string} label - Optional label text to display below percentage
 * @param {string} color - Color of the progress bar (default: '#D35C34')
 * @param {number} height - Height of the progress bar (default: 8)
 * @param {object} style - Additional styles for the container
 */
const ProgressBar = ({
  progress = 0,
  showPercentage = true,
  label,
  color = '#D35C34',
  height = 8,
  style
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);
  
  return (
    <View style={[styles.container, style]}>
      {showPercentage && (
        <Text style={styles.percentText}>
          {normalizedProgress}% {label ? 'COMPLETE' : ''}
        </Text>
      )}
      
      <View style={[styles.progressBar, { height }]}>
        <View 
          style={[
            styles.progress, 
            { 
              width: `${normalizedProgress}%`,
              backgroundColor: color,
              height: '100%' 
            }
          ]} 
        />
      </View>
      
      {label && !showPercentage && (
        <Text style={styles.labelText}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 5,
  },
  percentText: {
    fontSize: Math.min(12, width * 0.03),
    color: '#6B6B5A',
    marginBottom: 4,
  },
  progressBar: {
    backgroundColor: '#E0D8C0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  labelText: {
    fontSize: Math.min(12, width * 0.03),
    color: '#6B6B5A',
    marginTop: 4,
  },
});

export default ProgressBar; 