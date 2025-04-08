import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens
import AuthenticationScreen from '../screens/auth/AuthenticationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Create the navigation stack
const Stack = createNativeStackNavigator();

/**
 * AuthNavigator - Navigation stack for authentication flow
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Authentication"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1E1E1E' }
      }}
    >
      <Stack.Screen 
        name="Authentication" 
        component={AuthenticationScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 