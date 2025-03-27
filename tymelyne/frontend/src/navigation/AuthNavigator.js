import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens
import {
  AuthenticationScreen,
  SignInScreen,
  SignUpScreen
} from '../screens/auth';

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
        name="SignIn" 
        component={SignInScreen} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 