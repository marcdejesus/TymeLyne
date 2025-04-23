import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { createCourse } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const CourseCreateScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // Form state
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [hasTriedBefore, setHasTriedBefore] = useState(null);
  const [timePerDay, setTimePerDay] = useState(null);
  const [aiSupport, setAiSupport] = useState(null);
  const [deadline, setDeadline] = useState('');
  const [includeRealWorldTasks, setIncludeRealWorldTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionsCount, setSectionsCount] = useState(3);
  const [difficulty, setDifficulty] = useState('Beginner');
  
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

  // Map skill level to difficulty
  const mapSkillLevelToDifficulty = (level) => {
    switch(level) {
      case 'I\'m a total beginner':
        return 'Beginner';
      case 'I\'ve dabbled a bit':
        return 'Beginner';
      case 'I\'m intermediate':
        return 'Intermediate';
      case 'I\'m advanced and want to refine':
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };

  // Handle course generation with all form data
  const handleCreateCourse = async () => {
    if (!courseTitle.trim()) {
      Alert.alert('Error', 'Please enter a topic for your course');
      return;
    }

    // Validate required fields
    if (!selectedGoal || !skillLevel || !timePerDay) {
      Alert.alert('Missing Information', 'Please fill out all required fields (Goal, Skill Level, and Time Commitment)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a detailed prompt based on questionnaire
      const userPreferences = {
        topic: courseTitle.trim(),
        goal: selectedGoal,
        skillLevel: skillLevel,
        hasTriedBefore: hasTriedBefore,
        timePerDay: timePerDay,
        aiSupport: aiSupport,
        deadline: deadline,
        includeRealWorldTasks: includeRealWorldTasks,
        sectionsCount: sectionsCount,
        difficulty: mapSkillLevelToDifficulty(skillLevel)
      };
      
      const result = await createCourse(userPreferences);
      
      setLoading(false);
      
      if (result && result.course) {
        // Log the course data structure to help with debugging
        console.log('Course created successfully:', result.course);
        
        // Format course data consistently with expected properties
        const formattedCourse = {
          ...result.course,
          // Ensure necessary fields exist for CourseSections screen
          course_name: result.course.title,  // Backup for older screens expecting course_name
          course_exp: 500, // Default XP if not provided
          tags: result.course.tags || [userPreferences.topic], // Use tags if available or create from topic
        };
        
        Alert.alert(
          'Success',
          `Course "${result.course.title}" created successfully!`,
          [
            {
              text: 'View Course',
              onPress: () => navigation.navigate('CourseSections', { 
                courseId: result.course.course_id || result.course._id,
                courseData: formattedCourse
              })
            },
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setCourseTitle('');
                setSelectedGoal(null);
                setSkillLevel(null);
                setHasTriedBefore(null);
                setTimePerDay(null);
                setAiSupport(null);
                setDeadline('');
                setIncludeRealWorldTasks(null);
              }
            }
          ]
        );
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to generate course. Please try again.');
      Alert.alert('Error', err.message || 'Failed to generate course. Please try again.');
    }
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
          <Typography variant="h2" style={styles.heading}>
            AI Course Generator
          </Typography>
            
          <Typography variant="body1" style={styles.description}>
            Answer a few questions to help our AI create a personalized learning experience for you.
          </Typography>
        
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
            <QuestionLabel number={6} text="How do you want the AI to support you?" />
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
            <QuestionLabel number={7} text="Is there a deadline you're working toward? (Optional)" />
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
            <QuestionLabel number={8} text="Would you like the course to include real-world tasks or project-based learning?" />
            {yesNoOptions.map((option, index) => (
              <RadioButton
                key={index}
                selected={includeRealWorldTasks === option}
                onPress={() => handleSelectOption(option, setIncludeRealWorldTasks, includeRealWorldTasks)}
                label={option}
              />
            ))}
          </View>
          
          <View style={styles.questionContainer}>
            <Typography variant="label" style={styles.pickerLabel}>
              Number of Sections: {sectionsCount}
            </Typography>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={15}
              step={1}
              value={sectionsCount}
              onValueChange={(value) => setSectionsCount(Math.round(value))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Typography variant="caption">1</Typography>
              <Typography variant="caption">15</Typography>
            </View>
          </View>
          
          {error && (
            <Typography variant="body2" style={styles.errorText}>
              {error}
            </Typography>
          )}
          
          <View style={styles.actionContainer}>
            <Typography variant="body" color={colors.text.primary}>
              AI-Powered Learning
            </Typography>
            <Button
              title={loading ? "Generating..." : "Generate Course"}
              onPress={handleCreateCourse}
              style={styles.button}
              disabled={loading || !courseTitle.trim() || !selectedGoal || !skillLevel || !timePerDay}
            />
          </View>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Typography variant="body2" style={styles.loadingText}>
                Creating your personalized course... This may take a minute.
              </Typography>
            </View>
          )}
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
  <View style={styles.questionLabelContainer}>
    <View style={styles.questionNumberCircle}>
      <Typography variant="body" weight="semiBold" color="white">
        {number}
      </Typography>
    </View>
    <Typography variant="body" weight="semiBold" style={styles.questionText}>
      {text}
    </Typography>
  </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
  },
  cardContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.l,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    marginVertical: spacing.m,
  },
  questionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  questionNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  questionText: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: spacing.l,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  heading: {
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  pickerLabel: {
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
    backgroundColor: colors.surface,
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: spacing.m,
  },
  loadingContainer: {
    marginTop: spacing.l,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.s,
    textAlign: 'center',
  },
  errorText: {
    color: colors.status.error,
    marginBottom: spacing.s,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
});

export default CourseCreateScreen; 