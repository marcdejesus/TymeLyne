import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { buttons, colors, shadows } from '../constants/theme';
import Typography from './Typography';

/**
 * Button component with consistent styling across the app.
 * Uses the app's theme and Typography component.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.variant - Button variant. Options: 'primary', 'secondary', 'outline'.
 * @param {string} props.size - Button size. Options: 'small', 'medium', 'large'.
 * @param {boolean} props.fullWidth - Whether the button should take full width.
 * @param {boolean} props.disabled - Whether the button is disabled.
 * @param {boolean} props.loading - Whether to show loading indicator.
 * @param {Function} props.onPress - Function to call when button is pressed.
 * @param {ReactNode} props.icon - Optional icon to display before text.
 * @param {Object} props.style - Additional button styles.
 * @param {string} props.label - Button text.
 * @returns {ReactNode} - Button component.
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  icon,
  style,
  label,
  ...props 
}) => {
  // Determine which button style to use
  const buttonStyle = disabled ? buttons.disabled : buttons[variant] || buttons.primary;
  
  // Determine size-specific styles
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    }
  };
  
  // Get current size style
  const sizeStyle = sizeStyles[size] || sizeStyles.medium;
  
  // Determine text color based on variant and disabled state
  const textColor = disabled ? 
    colors.text.disabled : 
    buttonStyle.textColor;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonStyle.backgroundColor },
        sizeStyle,
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        buttonStyle.borderRadius && { borderRadius: buttonStyle.borderRadius },
        buttonStyle.borderWidth && { 
          borderWidth: buttonStyle.borderWidth,
          borderColor: buttonStyle.borderColor || colors.primary 
        },
        !disabled && buttonStyle.shadowColor && shadows.small,
        style
      ]}
      onPress={loading || disabled ? null : onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={textColor}
            style={styles.loader} 
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Typography 
              variant="button" 
              weight="medium"
              color={textColor} 
              center
            >
              {label}
            </Typography>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginRight: 8,
  },
  loader: {
    marginRight: 8,
  }
});

export default Button; 