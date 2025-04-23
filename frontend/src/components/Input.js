import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { inputs, colors, borderRadius, spacing, typography } from '../constants/theme';
import Typography from './Typography';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * Input component with consistent styling across the app.
 * Uses the app's theme and Typography component.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.label - Label text for the input.
 * @param {string} props.placeholder - Placeholder text.
 * @param {string} props.value - Current value of the input.
 * @param {Function} props.onChangeText - Function to call when text changes.
 * @param {boolean} props.secureTextEntry - Whether to hide text entry (for passwords).
 * @param {string} props.error - Error message to display.
 * @param {string} props.helperText - Helper text to display below input.
 * @param {boolean} props.multiline - Whether the input is multiline.
 * @param {Object} props.style - Additional input container styles.
 * @param {Object} props.inputStyle - Additional text input styles.
 * @param {Object} props.leftIcon - Icon to show on the left side of the input.
 * @param {Object} props.rightIcon - Icon to show on the right side of the input.
 * @param {Function} props.onRightIconPress - Function to call when right icon is pressed.
 * @returns {ReactNode} - Input component.
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  helperText,
  multiline = false,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) {
      // Use setTimeout to avoid immediate layout changes that can cause scroll jumps
      setTimeout(() => {
        props.onFocus();
      }, 100);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur();
  };

  // Determine container styles based on focus and error state
  const containerStyles = [
    styles.container,
    style
  ];

  // Determine input container styles based on focus and error state
  const inputContainerStyles = [
    styles.inputContainer,
    inputs.default,
    isFocused && inputs.focus,
    error && inputs.error
  ];

  return (
    <View style={containerStyles}>
      {/* Label */}
      {label && (
        <Typography 
          variant="caption" 
          style={styles.label}
          color={error ? colors.status.error : colors.text.secondary}
        >
          {label}
        </Typography>
      )}

      {/* Input container with icons */}
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          returnKeyType={multiline ? "default" : "done"}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Icon 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.text.tertiary} 
            />
          </TouchableOpacity>
        )}

        {rightIcon && onRightIconPress && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}

        {rightIcon && !onRightIconPress && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error or helper text */}
      {(error || helperText) && (
        <Typography 
          variant="caption" 
          style={styles.helperText}
          color={error ? colors.status.error : colors.text.tertiary}
        >
          {error || helperText}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.m,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leftIconContainer: {
    paddingLeft: spacing.s,
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    paddingRight: spacing.s,
    marginLeft: spacing.xs,
  },
  helperText: {
    marginTop: spacing.xs,
  }
});

export default Input; 