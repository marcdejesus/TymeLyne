import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';

export default function App() {
  // For demo purposes, set this to true to see the main app screens
  // In a real app, this would be determined by authentication status
  const isAuthenticated = true;

  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
