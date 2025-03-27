import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ThemeContext - Provides theme colors and settings throughout the app
 */

// Default theme values
const defaultTheme = {
  accent: '#FF9500', // Orange - Default
  // Alternative colors
  alternateColors: [
    '#FF9500', // Orange - Default
    '#E74C3C', // Red
    '#3498DB', // Blue
    '#2ECC71', // Green
    '#9B59B6', // Purple
  ],
  darkMode: true,
  darkTheme: {
    background: '#1E1E1E',
    card: '#333333',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#444444',
  },
  lightTheme: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    ...defaultTheme,
    current: defaultTheme.darkMode ? defaultTheme.darkTheme : defaultTheme.lightTheme
  });
  
  // Load saved theme from AsyncStorage on init
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          setTheme(prevTheme => ({
            ...prevTheme,
            accent: parsedTheme.accent || prevTheme.accent,
            darkMode: parsedTheme.darkMode !== undefined ? parsedTheme.darkMode : prevTheme.darkMode,
            current: parsedTheme.darkMode ? prevTheme.darkTheme : prevTheme.lightTheme
          }));
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Toggle dark/light mode
  const toggleDarkMode = async () => {
    const newDarkMode = !theme.darkMode;
    const newTheme = {
      ...theme,
      darkMode: newDarkMode,
      current: newDarkMode ? theme.darkTheme : theme.lightTheme
    };
    
    setTheme(newTheme);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('appTheme', JSON.stringify({
        accent: theme.accent,
        darkMode: newDarkMode
      }));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };
  
  // Change accent color
  const changeAccentColor = async (color) => {
    if (!theme.alternateColors.includes(color)) {
      return; // Invalid color
    }
    
    const newTheme = {
      ...theme,
      accent: color
    };
    
    setTheme(newTheme);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('appTheme', JSON.stringify({
        accent: color,
        darkMode: theme.darkMode
      }));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };
  
  // Provide theme and theme-changing functions
  return (
    <ThemeContext.Provider 
      value={{
        ...theme,
        toggleDarkMode,
        changeAccentColor
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 