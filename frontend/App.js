import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/constants/theme';
import * as Font from 'expo-font';
import { 
  useFonts,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold
} from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { resetAuthState } from './src/utils/resetAuth';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DevelopmentScreen from './src/screens/DevelopmentScreen';
import CourseCreateScreen from './src/screens/CourseCreateScreen';
import CourseDetailsScreen from './src/screens/CourseDetailsScreen';
import CourseSectionsScreen from './src/screens/CourseSectionsScreen';
import SectionContent from './src/screens/SectionContent';
import SectionQuiz from './src/screens/SectionQuiz';
import MessagesScreen from './src/screens/MessagesScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import LeaderboardsScreen from './src/screens/LeaderboardsScreen';
import AllCoursesScreen from './src/screens/AllCoursesScreen';

// Auth Context
import AuthProvider, { AuthContext } from './src/contexts/AuthContext';
import UserProgressionProvider from './src/contexts/UserProgressionContext';

// Enable mock API mode for development when backend isn't available
if (__DEV__) {
  global.MOCK_API = true;
  console.log('Mock API mode enabled for development');
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 5,
          paddingTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LeaderboardsTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Montserrat_500Medium',
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="LeaderboardsTab" 
        component={LeaderboardsScreen}
        options={{ tabBarLabel: 'Leaderboards' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Component to handle conditional rendering based on auth state
const AppContent = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        // Auth Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // Main App Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Development" component={DevelopmentScreen} />
          <Stack.Screen name="Create" component={CourseCreateScreen} />
          <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
          <Stack.Screen name="CourseSections" component={CourseSectionsScreen} />
          <Stack.Screen name="SectionContent" component={SectionContent} />
          <Stack.Screen name="SectionQuiz" component={SectionQuiz} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
          <Stack.Screen name="AllCourses" component={AllCoursesScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProgressionProvider>
          <StatusBar style="dark-content" backgroundColor={colors.background} />
          <AppContent />
        </UserProgressionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
