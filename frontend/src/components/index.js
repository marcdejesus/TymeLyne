// UI Components
import Button from './Button';
import Card from './Card';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';
import Header from './Header';
import InputField from './InputField';
import ProgressBar from './ProgressBar';
import SafeAreaContainer from './SafeAreaContainer';
import Screen from './Screen';
import SectionTitle from './SectionTitle';
import BottomNavigation from './BottomNavigation';
import ComponentUsageExample from './ComponentUsageExample';

// Constants and Theme
import theme from '../constants/theme';

export {
  // UI Components
  Button,
  Card,
  ContentContainer,
  CourseCard,
  Header,
  InputField,
  ProgressBar,
  SafeAreaContainer,
  Screen,
  SectionTitle,
  BottomNavigation,
  ComponentUsageExample,
  
  // Constants and Theme
  theme
};

/**
 * UI Components Library
 * 
 * This file exports all UI components for easy importing in screens.
 * Example usage:
 * 
 * import { Button, Card, Screen, theme } from '../components';
 * 
 * const MyScreen = ({ navigation }) => {
 *   return (
 *     <Screen 
 *       title="My Screen"
 *       onBackPress={() => navigation.goBack()}
 *       activeScreen="Home"
 *       onHomePress={() => navigation.navigate('Home')}
 *       onAchievementsPress={() => navigation.navigate('Achievements')}
 *       onProfilePress={() => navigation.navigate('Profile')}
 *     >
 *       <Card>
 *         <Text style={{ color: theme.colors.text.primary }}>Hello World</Text>
 *         <Button title="Press Me" onPress={() => alert('Button pressed')} />
 *       </Card>
 *     </Screen>
 *   );
 * };
 */ 