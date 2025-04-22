import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { typography, colors } from '../constants/theme';
import { useFonts, 
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold
} from '@expo-google-fonts/montserrat';

/**
 * Typography component for consistent text styling across the app.
 * Uses Montserrat font with various preset styles.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.variant - Text variant. Options: 'caption', 'body', 'button', 'subheading', 'title', 'heading', 'largeHeading'.
 * @param {string} props.weight - Font weight. Options: 'light', 'regular', 'medium', 'semiBold', 'bold'.
 * @param {string} props.color - Text color. Use predefined colors from theme or hex value.
 * @param {Object} props.style - Additional text styles.
 * @param {boolean} props.center - Center align text.
 * @param {number} props.numberOfLines - Number of lines to display.
 * @param {ReactNode} props.children - Text content.
 * @returns {ReactNode} - Typography component.
 */
const Typography = ({ 
  variant = 'body', 
  weight = 'regular', 
  color,
  style, 
  center = false, 
  numberOfLines,
  children,
  ...props 
}) => {
  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  // Use a default style if fonts are not loaded yet
  if (!fontsLoaded) {
    return (
      <RNText 
        style={[
          { fontFamily: undefined, fontSize: 16 },
          center && { textAlign: 'center' },
          style
        ]}
        numberOfLines={numberOfLines}
        {...props}
      >
        {children}
      </RNText>
    );
  }

  // Get the corresponding styles based on variant and weight
  const variantStyle = styles[variant] || styles.body;
  const fontFamily = typography.fontFamily[weight] || typography.fontFamily.regular;
  const textColor = color ? 
    (colors.text[color] || color) : 
    colors.text.primary;

  return (
    <RNText 
      style={[
        variantStyle,
        { fontFamily, color: textColor },
        center && { textAlign: 'center' },
        style
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  caption: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption
  },
  body: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body
  },
  button: {
    fontSize: typography.fontSize.button,
    lineHeight: typography.lineHeight.button
  },
  subheading: {
    fontSize: typography.fontSize.subheading,
    lineHeight: typography.lineHeight.subheading
  },
  title: {
    fontSize: typography.fontSize.title,
    lineHeight: typography.lineHeight.title
  },
  heading: {
    fontSize: typography.fontSize.heading,
    lineHeight: typography.lineHeight.heading
  },
  largeHeading: {
    fontSize: typography.fontSize.largeHeading,
    lineHeight: typography.lineHeight.largeHeading
  }
});

export default Typography; 