import { Dimensions, Platform } from 'react-native';
import { Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

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
  primary: '#6366F1', // Soft Blue-Violet (calm + smart)
  primaryDark: '#4338CA', // Darker variant for pressed states
  primaryLight: '#C7D2FE', // Light variant for backgrounds and accents
  
  // Secondary colors
  secondary: '#14B8A6', // Teal (learning, progress)
  secondaryDark: '#0F766E', // Darker teal for pressed states
  secondaryLight: '#99F6E4', // Light teal for backgrounds
  
  // Accent color
  accent: '#F97316', // Vibrant Orange (for pop & reward)
  
  // Background colors
  background: '#FAFAFA', // Main background
  card: '#F4F4F5', // Card background
  cardDark: '#E4E4E7', // Slightly darker card background
  input: '#E5E7EB', // Input field background
  
  // Text colors
  text: {
    primary: '#1F2937', // Primary text
    secondary: '#6B7280', // Secondary text
    tertiary: '#9CA3AF', // Tertiary text
    disabled: '#D1D5DB', // Disabled text
    inverted: '#FFFFFF', // Text on dark backgrounds
  },
  
  // UI colors
  border: '#E2E8F0', // Border color
  separator: '#F1F5F9', // Separator line color
  highlight: '#FEF3C7', // Highlight background
  
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
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Font sizes - with responsive scaling for different devices
  fontSize: {
    small: Math.min(10, width * 0.025),     // Very small text
    caption: Math.min(12, width * 0.03),     // Small captions, labels
    regular: Math.min(16, width * 0.04),     // Regular text (same as body)
    body: Math.min(16, width * 0.04),        // Body text
    button: Math.min(14, width * 0.035),     // Button text
    medium: Math.min(16, width * 0.04),      // Medium text (same as body)
    subheading: Math.min(18, width * 0.045), // Subheadings
    title: Math.min(20, width * 0.05),       // Titles
    large: Math.min(22, width * 0.055),      // Large text
    heading: Math.min(24, width * 0.06),     // Headings
    largeHeading: Math.min(28, width * 0.07), // Large headings
    xxlarge: Math.min(32, width * 0.08)      // Extra large text
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