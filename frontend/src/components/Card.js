import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { colors, shadows, spacing, borderRadius } from '../constants/theme';

/**
 * Card component with different variants based on our design system
 * 
 * @param {string} variant - Card variant: 'flat', 'elevated', 'outlined'
 * @param {function} onPress - Function to call when card is pressed
 * @param {ReactNode} children - Card content
 * @param {object} style - Additional style for the card
 * @param {string} backgroundColor - Background color of the card
 * @param {boolean} disabled - Whether the card is disabled/inactive
 * @param {number} activeOpacity - Opacity when pressed (0 to 1)
 * @param {object} props - Additional props to pass to View/TouchableOpacity
 */
const Card = ({
  variant = 'flat',
  onPress,
  children,
  style,
  backgroundColor,
  disabled = false,
  activeOpacity = 0.8,
  ...props
}) => {
  // Determine the background color
  const bgColor = backgroundColor || 
    (variant === 'outlined' ? 'transparent' : colors.card);

  // Base card styles based on variant
  const cardStyles = [
    styles.card,
    styles[variant],
    { backgroundColor: bgColor },
    disabled && styles.disabled,
    style
  ];

  // If onPress is provided, render a TouchableOpacity, otherwise render a View
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={disabled ? null : onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.m,
    padding: spacing.m,
    backgroundColor: colors.card,
  },
  
  // Variant styles
  flat: {
    // Just the base style
  },
  
  elevated: {
    ...shadows.medium,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // State styles
  disabled: {
    opacity: 0.6,
  }
});

export default Card; 