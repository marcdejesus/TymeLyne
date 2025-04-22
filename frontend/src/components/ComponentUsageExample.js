import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaContainer from './SafeAreaContainer';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import ContentContainer from './ContentContainer';
import SectionTitle from './SectionTitle';
import CourseCard from './CourseCard';
import ProgressBar from './ProgressBar';
import Card from './Card';
import Button from './Button';
import InputField from './InputField';
import theme from '../constants/theme';

/**
 * Example component demonstrating how to use all the UI components together
 * This is not meant to be a real screen, just a reference for developers
 */
const ComponentUsageExample = ({ navigation }) => {
  const mockCourses = [
    { 
      id: 1, 
      title: 'Introduction to React Native', 
      icon: require('../../assets/course-icons/computer.png'),
      progress: 65 
    },
    { 
      id: 2, 
      title: 'Mobile App Design', 
      icon: require('../../assets/course-icons/design.png'),
      progress: 30 
    }
  ];

  return (
    <SafeAreaContainer backgroundColor={theme.colors.background.main}>
      <Header 
        title="Component Examples"
        onBackPress={() => navigation.goBack()}
        onRightPress={() => alert('Right button pressed')}
        rightIcon="settings-outline"
      />
      
      <ContentContainer>
        <SectionTitle 
          title="Header Example" 
          rightText="More info"
          onRightPress={() => alert('More info pressed')}
        />
        
        <Card>
          <Text style={styles.text}>
            Headers provide navigation and context for the screen.
            They can include back buttons, menu buttons, or action buttons.
          </Text>
        </Card>
        
        <SectionTitle title="Card and Button Examples" />
        
        <Card>
          <Text style={styles.heading}>Card Component</Text>
          <Text style={styles.text}>
            Cards are used to group related content and actions.
            They provide visual separation and can be touchable.
          </Text>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Primary" 
              onPress={() => alert('Primary button pressed')}
              style={styles.button}
            />
            <Button 
              title="Secondary" 
              variant="secondary"
              onPress={() => alert('Secondary button pressed')}
              style={styles.button}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Outline" 
              variant="outline"
              onPress={() => alert('Outline button pressed')}
              style={styles.button}
            />
            <Button 
              title="Text Button" 
              variant="text"
              onPress={() => alert('Text button pressed')}
              style={styles.button}
            />
          </View>
        </Card>
        
        <SectionTitle title="Form Input Example" />
        
        <Card>
          <InputField 
            label="Username"
            placeholder="Enter your username"
            value=""
            onChangeText={() => {}}
          />
          
          <InputField 
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value=""
            onChangeText={() => {}}
          />
        </Card>
        
        <SectionTitle title="Progress Bar Example" />
        
        <Card>
          <Text style={styles.label}>Default Progress (65%)</Text>
          <ProgressBar progress={65} />
          
          <Text style={styles.label}>Custom Color and Height</Text>
          <ProgressBar 
            progress={30} 
            color={theme.colors.secondary}
            height={12}
          />
          
          <Text style={styles.label}>Without Percentage Text</Text>
          <ProgressBar 
            progress={80} 
            showPercentage={false}
            label="Course completion"
          />
        </Card>
        
        <SectionTitle title="Course Card Examples" />
        
        {mockCourses.map(course => (
          <CourseCard 
            key={course.id}
            course={course}
            onPress={() => alert(`Course ${course.title} pressed`)}
            onOptionsPress={() => alert(`Options for ${course.title} pressed`)}
          />
        ))}
        
        <SectionTitle title="Grid Cards Example" />
        
        <View style={styles.gridContainer}>
          {mockCourses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              variant="grid"
              onPress={() => alert(`Grid card ${course.title} pressed`)}
              style={styles.gridCard}
            />
          ))}
        </View>
      </ContentContainer>
      
      <BottomNavigation 
        activeScreen="Home"
        onHomePress={() => alert('Home pressed')}
        onAchievementsPress={() => alert('Achievements pressed')}
        onProfilePress={() => alert('Profile pressed')}
      />
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.m,
  },
  heading: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    margin: '1%',
  }
});

export default ComponentUsageExample; 