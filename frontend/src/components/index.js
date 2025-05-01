// UI Components
import Button from './Button';
import Card from './Card';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';
import Header from './Header';
import Input from './Input';
import ProgressBar from './ProgressBar';
import SafeAreaContainer from './SafeAreaContainer';
import Screen from './Screen';
import SectionTitle from './SectionTitle';
import BottomNavigation from './BottomNavigation';
import ComponentUsageExample from './ComponentUsageExample';
import Typography from './Typography';

// Constants and Theme
import theme from '../constants/theme';

export {
  // UI Components
  Button,
  Card,
  ContentContainer,
  CourseCard,
  Header,
  Input,
  ProgressBar,
  SafeAreaContainer,
  Screen,
  SectionTitle,
  BottomNavigation,
  ComponentUsageExample,
  Typography,
  
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
 *       showBottomNav={false} // Bottom navigation now handled by Tab.Navigator
 *     >
 *       <Card>
 *         <Text style={{ color: theme.colors.text.primary }}>Hello World</Text>
 *         <Button title="Press Me" onPress={() => alert('Button pressed')} />
 *       </Card>
 *     </Screen>
 *   );
 * };
 */ 