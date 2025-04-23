import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

const CourseCreateScreen = ({ navigation }) => {
  // State variables for form inputs
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [hasTriedBefore, setHasTriedBefore] = useState(null);
  const [timePerDay, setTimePerDay] = useState(null);
  const [aiSupport, setAiSupport] = useState(null);
  const [deadline, setDeadline] = useState('');
  const [includeRealWorldTasks, setIncludeRealWorldTasks] = useState(null);
  
  // Radio button options
  const goalOptions = [
    'Learn a new skill from scratch',
    'Improve existing skills',
    'Prepare for an exam/certification',
    'Build a habit or routine',
    'Explore a topic casually'
  ];
  
  const skillLevelOptions = [
    'I\'m a total beginner',
    'I\'ve dabbled a bit',
    'I\'m intermediate',
    'I\'m advanced and want to refine'
  ];
  
  const timeOptions = [
    'Less than 10 minutes',
    '10-20 minutes',
    '20-30 minutes',
    '30+ minutes'
  ];
  
  const aiSupportOptions = [
    'Push me hard',
    'Keep things casual and fun',
    'Help me stay consistent',
    'Just give me structure and get out of the way'
  ];
  
  const yesNoOptions = ['Yes', 'No'];
  
  // Handle radio button selection
  const handleSelectOption = (option, setter, currentValue) => {
    setter(option === currentValue ? null : option);
  };
  
  // Render radio button
  const RadioButton = ({ selected, onPress, label }) => (
    <View style={styles.radioOptionContainer}>
      <TouchableOpacity 
        style={styles.radioButton}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[
          styles.radioCircle,
          selected && styles.radioCircleSelected
        ]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
      <Typography 
        variant="body" 
        color={colors.text.primary}
      >
        {label}
      </Typography>
    </View>
  );
  
  // Handle course creation
  const handleCreateCourse = () => {
    // Validate form and create course
    navigation.navigate('Home');
  };
  
  return (
    <View style={styles.mainContainer}>
      {/* Static header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="title" weight="semiBold">
          Course Creation
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.cardContainer}>
          <SectionHeader title="Definition" />
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={1} text="What would you like to get better at?" />
            <Input
              placeholder="Enter skill or topic"
              value={courseTitle}
              onChangeText={text => setCourseTitle(text)}
            />
          </View>
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={2} text="Which best describes your goal?" />
            {goalOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={selectedGoal === option}
                onPress={() => handleSelectOption(option, setSelectedGoal, selectedGoal)}
                label={option}
              />
            ))}
          </View>
          
          <SectionHeader title="Skill Level" />
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={3} text="How experienced are you in this topic?" />
            {skillLevelOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={skillLevel === option}
                onPress={() => handleSelectOption(option, setSkillLevel, skillLevel)}
                label={option}
              />
            ))}
          </View>
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={4} text="Have you tried learning this topic before?" />
            {yesNoOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={hasTriedBefore === option}
                onPress={() => handleSelectOption(option, setHasTriedBefore, hasTriedBefore)}
                label={option}
              />
            ))}
          </View>
          
          <SectionHeader title="Learning Style" />
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={5} text="How much time can you dedicate per day?" />
            {timeOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={timePerDay === option}
                onPress={() => handleSelectOption(option, setTimePerDay, timePerDay)}
                label={option}
              />
            ))}
          </View>
          
          <SectionHeader title="Motivation" />
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={8} text="How do you want the AI to support you?" />
            {aiSupportOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={aiSupport === option}
                onPress={() => handleSelectOption(option, setAiSupport, aiSupport)}
                label={option}
              />
            ))}
          </View>
          
          <SectionHeader title="Customization" />
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={9} text="Is there a deadline you're working toward? (Optional)" />
            <View style={styles.dateInputContainer}>
              <Input
                placeholder="MM/DD/YYYY"
                value={deadline}
                onChangeText={setDeadline}
                rightIcon={<Ionicons name="calendar-outline" size={20} color={colors.text.tertiary} />}
                style={styles.dateInput}
              />
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            <QuestionLabel number={10} text="Would you like the course to include real-world tasks or project-based learning?" />
            {yesNoOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={includeRealWorldTasks === option}
                onPress={() => handleSelectOption(option, setIncludeRealWorldTasks, includeRealWorldTasks)}
                label={option}
              />
            ))}
          </View>
          
          <View style={styles.actionContainer}>
            <Typography variant="body" color={colors.text.primary}>
              1 Use Left
            </Typography>
            <Button
              variant="primary"
              onPress={handleCreateCourse}
            >
              Create
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

// Helper components for consistent sections
const SectionHeader = ({ title }) => (
  <Typography 
    variant="title" 
    weight="semiBold" 
    style={styles.sectionTitle}
    center
  >
    {title}
  </Typography>
);

const QuestionLabel = ({ number, text }) => (
  <Typography 
    variant="body" 
    weight="medium" 
    style={styles.questionText}
  >
    {number}. {text}
  </Typography>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  cardContainer: {
    backgroundColor: colors.card,
    padding: spacing.l,
    borderRadius: borderRadius.m,
    ...shadows.medium,
  },
  sectionTitle: {
    marginVertical: spacing.m,
  },
  questionContainer: {
    marginBottom: spacing.l,
  },
  questionText: {
    marginBottom: spacing.s,
  },
  radioOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  radioButton: {
    marginRight: spacing.m,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dateInputContainer: {
    flexDirection: 'row',
  },
  dateInput: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
  },
});

export default CourseCreateScreen; 