import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import Typography from './Typography';
import { colors, shadows, spacing, borderRadius } from '../constants/theme';

/**
 * Button component with different variants that follows the design system
 * 
 * @param {string} variant - Button variant: 'primary', 'secondary', 'outline', 'text'
 * @param {function} onPress - Function to call when button is pressed
 * @param {ReactNode} children - Button content (text or components)
 * @param {string} title - Button text (used if children not provided)
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} loading - Whether to show a loading indicator
 * @param {object} style - Additional style for the button container
 * @param {object} textStyle - Additional style for the button text
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {number} activeOpacity - Opacity when pressed (0 to 1)
 * @param {object} props - Additional props to pass to TouchableOpacity
 */
const Button = ({
  variant = 'primary',
  onPress,
  children,
  title,
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  activeOpacity = 0.7,
  ...props
}) => {
  // Determine styles based on variant and size
  const getButtonStyle = () => {
    // Base styles
    const baseStyle = [
      styles.button,
      styles[`${variant}Button`],
      styles[`${size}Button`],
      fullWidth && styles.fullWidth,
      disabled && styles.disabledButton,
      style,
    ];
    
    return baseStyle;
  };
  
  // Determine text styles
  const getTextStyle = () => {
    return [
      styles.buttonText,
      styles[`${variant}Text`],
      styles[`${size}Text`],
      disabled && styles.disabledText,
      textStyle,
    ];
  };

  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    
    switch (variant) {
      case 'primary':
        return colors.text.inverted;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.primary;
      case 'text':
        return colors.primary;
      default:
        return colors.text.inverted;
    }
  };

  // Use title if children not provided
  const buttonText = children || title;

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        typeof buttonText === 'string' ? (
          <Typography 
            variant="button" 
            weight="medium" 
            style={getTextStyle()}
            color={getTextColor()}
          >
            {buttonText}
          </Typography>
        ) : (
          buttonText
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.m,
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    ...shadows.small,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    minHeight: 52,
  },
  
  // Text styles
  buttonText: {
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // State styles
  disabledButton: {
    backgroundColor: colors.cardDark,
    borderColor: colors.border,
    ...shadows.none,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button; 