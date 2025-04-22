import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device information
export const deviceInfo = {
  width,
  height,
  isSmallDevice: width < 375,
  isLargeDevice: width >= 768,
  isIphoneX: Platform.OS === 'ios' && (height > 800 || width > 800)
};

// Colors - Modern, clean palette
export const colors = {
  // Primary colors
  primary: '#6200EE', // Indigo - main brand color
  primaryDark: '#3700B3', // Darker variant for pressed states
  primaryLight: '#BB86FC', // Light variant for backgrounds and accents
  
  // Secondary colors
  secondary: '#03DAC5', // Teal - secondary brand color
  secondaryDark: '#018786', // Darker teal for pressed states
  secondaryLight: '#B2EBF2', // Light teal for backgrounds
  
  // Accent color
  accent: '#FF0266', // Pink - for highlighting important elements
  
  // Background colors
  background: '#FFFFFF', // Main background
  card: '#FAFAFA', // Card background
  cardDark: '#F2F3F5', // Darker card background
  input: '#F5F5F5', // Input field background
  
  // Text colors
  text: {
    primary: '#121212', // Primary text
    secondary: '#555555', // Secondary text
    tertiary: '#888888', // Tertiary text
    disabled: '#AAAAAA', // Disabled text
    inverted: '#FFFFFF', // Text on dark backgrounds
  },
  
  // UI colors
  border: '#E0E0E0', // Border color
  separator: '#EEEEEE', // Separator line color
  highlight: '#FFF9C4', // Highlight background
  
  // Status colors
  status: {
    error: '#B00020', // Error color
    success: '#4CAF50', // Success color
    warning: '#FFC107', // Warning color
    info: '#2196F3', // Info color
    online: '#43A047', // Online status
    offline: '#9E9E9E', // Offline status
  }
};

// Typography with Montserrat
export const typography = {
  // Font family
  fontFamily: {
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_500Medium',
    semiBold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
    light: 'Montserrat_300Light',
  },
  
  // Font sizes - with responsive scaling for different devices
  fontSize: {
    caption: Math.min(12, width * 0.03),     // Small captions, labels
    body: Math.min(16, width * 0.04),        // Body text
    button: Math.min(14, width * 0.035),     // Button text
    subheading: Math.min(18, width * 0.045), // Subheadings
    title: Math.min(20, width * 0.05),       // Titles
    heading: Math.min(24, width * 0.06),     // Headings
    largeHeading: Math.min(28, width * 0.07) // Large headings
  },
  
  // Line heights - for better readability
  lineHeight: {
    caption: 16,
    body: 24,
    button: 20,
    subheading: 26,
    title: 30,
    heading: 32,
    largeHeading: 38
  }
};

// Spacing - Consistent space units
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  
  // Dynamic spacing based on screen width
  horizontal: {
    small: width * 0.03,
    medium: width * 0.04,
    large: width * 0.06
  },
  vertical: {
    small: height * 0.01,
    medium: height * 0.02,
    large: height * 0.03
  }
};

// Styling for shadows
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  
  medium: Platform.select({
    ios: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  
  large: Platform.select({
    ios: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  })
};

// Border radius
export const borderRadius = {
  xs: 2,
  s: 4,
  m: 8, 
  l: 12,
  xl: 16,
  round: 999 // For circular elements
};

// Common button styles
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    textColor: colors.text.inverted,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.m,
    ...shadows.small
  },
  secondary: {
    backgroundColor: colors.secondary,
    textColor: colors.text.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.m,
    ...shadows.small
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.primary
  },
  disabled: {
    backgroundColor: colors.cardDark,
    textColor: colors.text.disabled,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.m
  }
};

// Common input styles
export const inputs = {
  default: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border
  },
  focus: {
    borderColor: colors.primary
  },
  error: {
    borderColor: colors.status.error
  }
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  deviceInfo,
  buttons,
  inputs
}; 