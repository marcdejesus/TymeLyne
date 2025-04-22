import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../constants/theme';
import Typography from './Typography';

/**
 * ProgressBar component that displays visual progress with optional label
 * 
 * @param {number} progress - Progress value between 0 and 100
 * @param {number} height - Height of the progress bar
 * @param {string} color - Color of the progress bar fill
 * @param {boolean} showLabel - Whether to show progress percentage label
 * @param {object} style - Additional style for the container
 * @param {object} barStyle - Additional style for the bar itself
 * @param {object} labelStyle - Additional style for the label
 */
const ProgressBar = ({
  progress = 0,
  height = 8,
  color = colors.primary,
  showLabel = false,
  style,
  barStyle,
  labelStyle
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Typography 
          variant="caption" 
          weight="medium" 
          style={[styles.label, labelStyle]}
        >
          {normalizedProgress}%
        </Typography>
      )}
      
      <View style={[styles.track, { height }, barStyle]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${normalizedProgress}%`,
              height,
              backgroundColor: color
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
    textAlign: 'right',
  },
  track: {
    width: '100%',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.s,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.s,
  }
});

export default ProgressBar; 