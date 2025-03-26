import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GoalsScreen from '../screens/main/GoalsScreen';
import GoalDetailScreen from '../screens/main/GoalDetailScreen';
import { Goal } from '../components/goals/GoalCard';

// Create a type for the Goals navigation stack
export type GoalsStackParamList = {
  GoalsList: undefined;
  GoalDetail: { goal: Goal };
};

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export default function GoalsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalsList" component={GoalsScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
    </Stack.Navigator>
  );
} 