import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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

// Auth Context
import AuthProvider, { AuthContext } from './src/contexts/AuthContext';

const Stack = createStackNavigator();

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
            // Disable animations by default
            animationEnabled: false
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
          
          {/* Enable animations for non-bottom tab screens */}
          <Stack.Screen 
            name="Development" 
            component={DevelopmentScreen} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="Create" 
            component={CourseCreateScreen} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="CourseDetails" 
            component={CourseDetailsScreen} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="CourseSections" 
            component={CourseSectionsScreen} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="SectionContent" 
            component={SectionContent} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="SectionQuiz" 
            component={SectionQuiz} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="Messages" 
            component={MessagesScreen} 
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name="Conversation" 
            component={ConversationScreen} 
            options={{ animationEnabled: true }}
          />
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
        <StatusBar style="dark-content" backgroundColor={colors.background} />
        <AppContent />
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
