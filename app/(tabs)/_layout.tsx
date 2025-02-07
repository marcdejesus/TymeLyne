import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
        tabBarLabel: () => null
      }}>
      <Tabs.Screen // This is the default tab, Home Page
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={31} color={color} />,
          tabBarLabel: () => null
        }}
      />
      <Tabs.Screen // This is the third tab, Calendar Page
        name="calendar"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size ={30} color={color} />,
          tabBarLabel: () => null
        }}
      />
      <Tabs.Screen // This is the third tab, Explore Page
        name="explore"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search" size={31} color={color} />,
          tabBarLabel: () => null
        }}
      />
      <Tabs.Screen // This is the fourth tab, Profile Page
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={31} color={color} />,
          tabBarLabel: () => null
        }}
      />
    </Tabs>
    
  );
}
