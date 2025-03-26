import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import Navigation from './src/navigation';
import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { useColorScheme } from 'react-native';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Comment out the Navigation import until all dependencies are installed
// import Navigation from './src/navigation';

// Wrapper component that uses the theme context
const ThemedApp = () => {
  const { theme, isDarkMode } = useTheme();
  
  // Adapt navigation themes
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });
  
  // Create a React Native Paper theme based on our custom theme
  const paperTheme = isDarkMode 
    ? { 
        ...MD3DarkTheme, 
        colors: { 
          ...MD3DarkTheme.colors, 
          primary: theme.primaryColor,
          secondary: theme.secondaryColor,
          background: theme.backgroundColor,
          surface: theme.cardColor,
        } 
      }
    : { 
        ...MD3LightTheme, 
        colors: { 
          ...MD3LightTheme.colors, 
          primary: theme.primaryColor,
          secondary: theme.secondaryColor,
          background: theme.backgroundColor,
          surface: theme.cardColor,
        } 
      };

  return (
    <PaperProvider theme={paperTheme}>
      <Navigation />
      <Toast />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
