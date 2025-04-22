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

// Colors
export const colors = {
  // Primary colors
  primary: '#FF7E17', // More vibrant orange for primary actions
  primaryLight: '#FFE4CC', // Lighter shade for backgrounds
  
  // Secondary colors
  secondary: '#3772FF', // Blue for secondary actions
  secondaryLight: '#E4ECFF', // Light blue for secondary backgrounds
  
  // Background colors
  background: '#F8F9FA', // Main background
  card: '#FFFFFF', // Card background
  cardDark: '#F2F3F5', // Darker card background
  input: '#F2F3F5', // Input field background
  
  // Text colors
  text: '#1A1A1A', // Primary text
  textSecondary: '#6B7280', // Secondary text
  textTertiary: '#9CA3AF', // Tertiary text
  textInverted: '#FFFFFF', // Text on dark backgrounds
  
  // UI colors
  border: '#E5E7EB', // Border color
  separator: '#F2F3F5', // Separator line color
  highlight: '#FFF4E6', // Highlight background
  error: '#EF4444', // Error color
  success: '#10B981', // Success color
  warning: '#F59E0B', // Warning color
  info: '#3B82F6', // Info color
  
  // Status colors
  online: '#34D399', // Online status
  offline: '#9CA3AF', // Offline status
  
  // Background colors
  background: {
    main: '#F9F1E0', // Beige main background
    card: '#F4ECE1',  // Slightly darker beige for cards
    contrast: '#FFFFFF' // White
  },
  
  // Text colors
  text: {
    primary: '#4A4A3A',   // Dark gray
    secondary: '#6B6B5A',  // Medium gray
    light: '#A0A0A0',      // Light gray
    inverse: '#FFFFFF'     // White text (for dark backgrounds)
  },
  
  // UI element colors
  ui: {
    border: '#E0D8C0',   // Light beige for borders
    progress: '#D35C34', // Orange for progress indicators
    success: '#4CAF50',  // Green
    warning: '#FFC107',  // Yellow
    error: '#FF4D4F',    // Red
    inactive: '#A0A0A0'  // Gray for inactive elements
  }
};

// Typography
export const typography = {
  fontSize: {
    tiny: Math.min(10, width * 0.025),
    small: Math.min(12, width * 0.03),
    medium: Math.min(14, width * 0.035),
    regular: Math.min(16, width * 0.04),
    large: Math.min(18, width * 0.045),
    xlarge: Math.min(20, width * 0.05),
    xxlarge: Math.min(24, width * 0.06)
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700'
  }
};

// Spacing
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  
  // Dynamic spacing based on screen width
  horizontal: width * 0.04,
  vertical: 16
};

// Styling for shadows
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: {
      elevation: 5,
    },
  })
};

// Border radius
export const borderRadius = {
  small: 4,
  medium: 8, 
  large: 12,
  round: 999 // For circular elements
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  deviceInfo
}; 