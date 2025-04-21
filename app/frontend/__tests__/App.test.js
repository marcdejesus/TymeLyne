import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the NavigationContainer
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => children,
  };
});

// Mock the stack navigator
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock the bottom tab navigator
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly with no stored token', async () => {
    // Mock AsyncStorage to return null for tokens
    AsyncStorage.getItem.mockImplementation((key) => {
      return Promise.resolve(null);
    });

    const { container } = render(<App />);
    
    // Wait for the app to initialize
    await waitFor(() => {
      // The app should start loading
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('access_token');
    });
  });

  it('should initialize correctly with a stored token', async () => {
    // Mock a valid token response
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'access_token') return Promise.resolve('valid-token');
      if (key === 'user') return Promise.resolve(JSON.stringify({ id: 1, username: 'testuser' }));
      return Promise.resolve(null);
    });

    const { container } = render(<App />);
    
    // Wait for the app to initialize
    await waitFor(() => {
      // The app should check for the token
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
    });
  });

  it('should handle network errors during bootup gracefully', async () => {
    // Mock AsyncStorage to throw an error
    AsyncStorage.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    // This should not crash
    const { container } = render(<App />);
    
    // Wait for the app to try to initialize
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
}); 