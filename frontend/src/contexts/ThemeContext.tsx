import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme definitions
export type ThemeKey = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'dark' | 'system';
export type AccentKey = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  streakColor: string;
  headerColor: string;
  textColor: string;
  tabBarColor: string;
  tabBarActiveColor: string;
  tabBarInactiveColor: string;
  fonts: {
    regular: {
      fontFamily: string;
      fontWeight?: string;
    };
    medium: {
      fontFamily: string;
      fontWeight?: string;
    };
    light: {
      fontFamily: string;
      fontWeight?: string;
    };
    thin: {
      fontFamily: string;
      fontWeight?: string;
    };
  };
}

// Default fonts configuration
const defaultFonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
  thin: {
    fontFamily: 'System',
    fontWeight: '100',
  },
};

// Light mode base theme
const lightBaseTheme = {
  backgroundColor: '#f8f8f8',
  cardColor: '#ffffff',
  textColor: '#333333',
  tabBarColor: '#ffffff',
  tabBarInactiveColor: '#757575',
};

// Dark mode base theme
const darkBaseTheme = {
  backgroundColor: '#121212',
  cardColor: '#1e1e1e',
  textColor: '#e1e1e1',
  tabBarColor: '#1e1e1e',
  tabBarInactiveColor: '#666666',
};

// Accent themes (only colors that change with theme accent)
export const accentThemes: Record<AccentKey, {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  streakColor: string;
  headerColor: string;
  tabBarActiveColor: string;
}> = {
  purple: {
    primaryColor: '#6200ee',
    secondaryColor: '#9c27b0',
    accentColor: '#f5a623',
    streakColor: '#f5a623',
    headerColor: '#1f2937',
    tabBarActiveColor: '#6200ee',
  },
  blue: {
    primaryColor: '#1976d2',
    secondaryColor: '#0d47a1',
    accentColor: '#64b5f6',
    streakColor: '#64b5f6',
    headerColor: '#0d3b66',
    tabBarActiveColor: '#1976d2',
  },
  green: {
    primaryColor: '#43a047',
    secondaryColor: '#2e7d32',
    accentColor: '#81c784',
    streakColor: '#81c784',
    headerColor: '#1e3d2a',
    tabBarActiveColor: '#43a047',
  },
  orange: {
    primaryColor: '#fb8c00',
    secondaryColor: '#ef6c00',
    accentColor: '#ffb74d',
    streakColor: '#ffb74d',
    headerColor: '#663d00',
    tabBarActiveColor: '#fb8c00',
  },
  pink: {
    primaryColor: '#ec407a',
    secondaryColor: '#d81b60',
    accentColor: '#f48fb1',
    streakColor: '#f48fb1',
    headerColor: '#5e0a30',
    tabBarActiveColor: '#ec407a',
  },
};

interface ThemeContextType {
  accentKey: AccentKey;
  theme: Theme;
  setAccentKey: (key: AccentKey) => void;
  useSystemTheme: boolean;
  setUseSystemTheme: (use: boolean) => void;
  isDarkMode: boolean;
}

const ACCENT_STORAGE_KEY = '@TymeLyne:accent';
const SYSTEM_THEME_STORAGE_KEY = '@TymeLyne:useSystemTheme';

const ThemeContext = createContext<ThemeContextType>({
  accentKey: 'purple',
  theme: { ...accentThemes.purple, ...lightBaseTheme, fonts: defaultFonts },
  setAccentKey: () => {},
  useSystemTheme: true,
  setUseSystemTheme: () => {},
  isDarkMode: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [accentKey, setAccentKey] = useState<AccentKey>('purple');
  const [useSystemTheme, setUseSystemTheme] = useState<boolean>(true);
  const [forceDarkMode, setForceDarkMode] = useState<boolean>(false);

  // Calculate if in dark mode
  const isDarkMode = useSystemTheme 
    ? deviceColorScheme === 'dark' 
    : forceDarkMode;

  // Load saved preferences from AsyncStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load accent theme
        const savedAccent = await AsyncStorage.getItem(ACCENT_STORAGE_KEY);
        if (savedAccent && Object.keys(accentThemes).includes(savedAccent)) {
          setAccentKey(savedAccent as AccentKey);
        }
        
        // Load system theme preference
        const savedSystemTheme = await AsyncStorage.getItem(SYSTEM_THEME_STORAGE_KEY);
        if (savedSystemTheme !== null) {
          setUseSystemTheme(savedSystemTheme === 'true');
          setForceDarkMode(savedSystemTheme === 'false' && savedAccent === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Save accent preference when it changes
  const handleAccentChange = async (newAccent: AccentKey) => {
    setAccentKey(newAccent);
    
    try {
      await AsyncStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
    } catch (error) {
      console.error('Error saving accent preference:', error);
    }
  };

  // Save system theme preference when it changes
  const handleSystemThemeChange = async (useSystem: boolean) => {
    setUseSystemTheme(useSystem);
    
    try {
      await AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, useSystem.toString());
    } catch (error) {
      console.error('Error saving system theme preference:', error);
    }
  };

  // Create the current theme by combining accent and base theme
  const currentTheme = (): Theme => {
    // Get base theme based on dark mode
    const baseTheme = isDarkMode ? darkBaseTheme : lightBaseTheme;
    
    // Combine with accent theme
    return {
      ...baseTheme,
      ...accentThemes[accentKey],
      fonts: defaultFonts
    };
  };

  return (
    <ThemeContext.Provider 
      value={{
        accentKey,
        theme: currentTheme(),
        setAccentKey: handleAccentChange,
        useSystemTheme,
        setUseSystemTheme: handleSystemThemeChange,
        isDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 