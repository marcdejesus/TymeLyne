import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import Typography from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

const CourseDetailsScreen = ({ navigation, route }) => {
  // In a real app, we would get the course details from the route params or fetch from API
  // For now, we'll use some mock data
  const mockCourse = {
    id: 1,
    title: 'Digital Marketing',
    description: 'Master the essential skills and strategies needed for effective digital marketing campaigns.',
    sections: [
      {
        id: 1,
        title: 'Introduction to Digital Marketing',
        description: 'Learn the fundamentals of digital marketing including key concepts, channels, and metrics for measuring success.',
        isCompleted: false,
        hasQuiz: true
      },
      {
        id: 2,
        title: 'Content Marketing Strategy',
        description: 'Develop effective content marketing strategies that drive engagement and conversions across different platforms.',
        isCompleted: true,
        hasQuiz: true
      },
      {
        id: 3,
        title: 'Social Media Marketing',
        description: 'Master social media marketing tactics for the major platforms including content creation, community management, and paid advertising.',
        isCompleted: false,
        hasQuiz: true
      }
    ]
  };
  
  const defaultCourse = {
    id: 0,
    title: 'Course Not Found',
    description: 'This course could not be loaded.',
    sections: []
  };
  
  // Use course from route params, or mockCourse for development, or defaultCourse as a fallback
  const course = route.params?.course || mockCourse;

  const handleBackPress = () => {
    navigation && navigation.goBack();
  };

  const handleSectionPress = (sectionId) => {
    if (navigation) {
      navigation.navigate('SectionContent', { courseId: course.id, sectionId });
    }
  };

  return (
    <Screen
      title={course.title}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      <View style={styles.courseHeader}>
        <Typography variant="h1" weight="bold" style={styles.courseTitle}>
          {course.title}
        </Typography>
        
        <Typography variant="body1" style={styles.courseDescription}>
          {course.description}
        </Typography>
      </View>

      <SectionTitle title="Course Content" />
      
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section) => (
          <Card
            key={section.id}
            style={styles.sectionCard}
            variant="elevated"
            onPress={() => handleSectionPress(section.id)}
          >
            <Typography variant="subheading" weight="semiBold" style={styles.sectionTitle}>
              {section.title}
            </Typography>
            
            <Typography variant="body2" color={colors.text.secondary} style={styles.sectionDescription} numberOfLines={3}>
              {section.description}
            </Typography>
            
            {section.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                <Typography variant="label" color={colors.status.success} style={styles.completedText}>
                  Completed
                </Typography>
              </View>
            )}
          </Card>
        ))
      ) : (
        <Card style={styles.sectionCard}>
          <Typography variant="body" style={styles.noContentMessage}>
            No course content available yet.
          </Typography>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  courseHeader: {
    alignItems: 'center',
    marginVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  courseTitle: {
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  courseDescription: {
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  sectionCard: {
    marginBottom: spacing.m,
    marginHorizontal: spacing.m,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    lineHeight: 20,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  completedText: {
    marginLeft: spacing.xs,
  },
  noContentMessage: {
    textAlign: 'center',
    marginVertical: spacing.m,
  },
});

export default CourseDetailsScreen; 