import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DevelopmentScreen from './src/screens/DevelopmentScreen';
import CourseCreateScreen from './src/screens/CourseCreateScreen';
import CourseDetailsScreen from './src/screens/CourseDetailsScreen';

// Auth Context
import AuthProvider, { AuthContext } from './src/contexts/AuthContext';

const Stack = createStackNavigator();

// Component to handle conditional rendering based on auth state
const AppContent = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D35C34" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        // Auth Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // Main App Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Development" component={DevelopmentScreen} />
          <Stack.Screen name="Create" component={CourseCreateScreen} />
          <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F1E0',
  },
});
