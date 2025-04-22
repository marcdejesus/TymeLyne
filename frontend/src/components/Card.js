import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../constants/theme';

/**
 * Card component with consistent styling across the app.
 * Can be made touchable with onPress prop.
 * 
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Card content.
 * @param {string} props.variant - Card variant. Options: 'elevated', 'outlined', 'flat'.
 * @param {Function} props.onPress - Function to call when card is pressed.
 * @param {Object} props.style - Additional card styles.
 * @param {boolean} props.noPadding - Whether to remove default padding.
 * @returns {ReactNode} - Card component.
 */
const Card = ({ 
  children, 
  variant = 'elevated', 
  onPress, 
  style,
  noPadding = false,
  ...props 
}) => {
  // Determine container styles based on variant
  const containerStyles = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    !noPadding && styles.padding,
    style
  ];

  // Render a touchable or non-touchable card
  if (onPress) {
    return (
      <TouchableOpacity 
        style={containerStyles} 
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.m,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginVertical: spacing.s
  },
  padding: {
    padding: spacing.m
  },
  elevated: {
    ...shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    // No additional styles for flat variant
  }
});

export default Card; 