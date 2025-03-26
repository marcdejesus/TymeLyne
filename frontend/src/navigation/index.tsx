import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import TasksScreen from '../screens/main/TasksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AchievementsScreen from '../components/profile/AchievementsScreen';

// Import navigators
import GoalsNavigator from './GoalsNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarColor,
          borderTopColor: theme.backgroundColor === '#121212' ? '#333' : '#ddd',
        },
        tabBarActiveTintColor: theme.tabBarActiveColor,
        tabBarInactiveTintColor: theme.tabBarInactiveColor,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="target" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  
  // Create a proper navigation theme based on our theme
  const isDark = theme.backgroundColor === '#121212';
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primaryColor,
      background: theme.backgroundColor,
      card: theme.cardColor,
      text: theme.textColor,
      border: isDark ? '#333' : '#ddd',
      notification: theme.accentColor,
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 