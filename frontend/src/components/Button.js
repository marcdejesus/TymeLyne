import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Button component with different variants (primary, secondary, outline, text)
 * Handles loading state and disabled state
 * 
 * @param {string} variant - 'primary', 'secondary', 'outline', or 'text'
 * @param {function} onPress - Function to call when button is pressed
 * @param {boolean} loading - Whether to show loading indicator
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} title - Text to display in button
 * @param {object} style - Additional styles for the button
 * @param {object} textStyle - Additional styles for the button text
 */
const Button = ({
  variant = 'primary',
  onPress,
  loading = false,
  disabled = false,
  title,
  style,
  textStyle,
  ...props
}) => {
  // Determine button and text style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textText;
      default:
        return styles.primaryText;
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonStyle(),
    disabled && styles.disabledButton,
    style
  ];

  const titleStyles = [
    styles.text,
    getTextStyle(),
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#684BFF'} 
        />
      ) : (
        <Text style={titleStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: width * 0.3,
  },
  primaryButton: {
    backgroundColor: '#684BFF',
  },
  secondaryButton: {
    backgroundColor: '#F0ECFF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#684BFF',
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#684BFF',
  },
  outlineText: {
    color: '#684BFF',
  },
  textText: {
    color: '#684BFF',
  },
  disabledText: {
    opacity: 0.6,
  },
});

export default Button; 