import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import Typography from '../components/Typography';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing } from '../constants/theme';
import { createCourse, getMyCourses } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const CourseGenerationScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [sectionsCount, setSectionsCount] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateCourse = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic for your course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await createCourse({
        topic: topic.trim(),
        difficulty,
        sectionsCount: parseInt(sectionsCount)
      });
      
      setLoading(false);
      
      if (result && result.course) {
        Alert.alert(
          'Success',
          `Course "${result.course.title}" created successfully!`,
          [
            {
              text: 'View Course',
              onPress: () => navigation.navigate('CourseDetails', { course: result.course })
            },
            {
              text: 'OK',
              onPress: () => {
                setTopic('');
                // Keep the other settings as they are
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

  return (
    <Screen
      title="Create New Course"
      onBackPress={() => navigation.goBack()}
      scrollable={true}
    >
      <View style={styles.container}>
        <Typography variant="h2" style={styles.heading}>
          Generate Course with AI
        </Typography>
        
        <Typography variant="body1" style={styles.description}>
          Enter a topic and our AI will create a complete course for you with detailed sections and quizzes.
        </Typography>
        
        <TextInput
          label="Course Topic"
          value={topic}
          onChangeText={setTopic}
          placeholder="E.g., Digital Marketing, Python Programming, Photography"
          style={styles.input}
        />
        
        <Typography variant="label" style={styles.pickerLabel}>
          Difficulty Level
        </Typography>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            onValueChange={(value) => setDifficulty(value)}
            style={styles.picker}
          >
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
          </Picker>
        </View>
        
        <Typography variant="label" style={styles.pickerLabel}>
          Number of Sections
        </Typography>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sectionsCount}
            onValueChange={(value) => setSectionsCount(value)}
            style={styles.picker}
          >
            <Picker.Item label="3 Sections" value="3" />
            <Picker.Item label="4 Sections" value="4" />
            <Picker.Item label="5 Sections" value="5" />
          </Picker>
        </View>
        
        {error && (
          <Typography variant="body2" style={styles.errorText}>
            {error}
          </Typography>
        )}
        
        <Button
          title={loading ? "Generating..." : "Generate Course"}
          onPress={handleGenerateCourse}
          style={styles.button}
          disabled={loading || !topic.trim()}
        />
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="body2" style={styles.loadingText}>
              Generating your course... This may take a minute.
            </Typography>
          </View>
        )}
        
        <Typography variant="caption" style={styles.note}>
          Note: Course generation uses AI and may take up to a minute to complete.
        </Typography>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.m,
  },
  heading: {
    marginBottom: spacing.s,
  },
  description: {
    marginBottom: spacing.l,
  },
  input: {
    marginBottom: spacing.m,
  },
  pickerLabel: {
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
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
  note: {
    marginTop: spacing.l,
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default CourseGenerationScreen; 