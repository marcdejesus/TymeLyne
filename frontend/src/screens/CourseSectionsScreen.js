import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Typography from '../components/Typography';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';
import { tymelyneTutorialData } from '../data/tutorialData';

const { width } = Dimensions.get('window');

/**
 * Course Sections Screen
 * Displays a list of sections for a specific course
 * 
 * @param {object} navigation - React Navigation object
 * @param {object} route - Route parameters with courseId
 */
const CourseSectionsScreen = ({ navigation, route }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mock data for demonstration - In production, this would come from an API
  const mockCourseData = {
    course_id: '123e4567-e89b-12d3-a456-426614174000',
    created_by: '098f6bcd-4621-3373-8ade-4e832627b4f6',
    created_at: '2023-10-15T14:30:00Z',
    course_name: 'Introduction to Digital Marketing',
    description: 'Master the essential skills and strategies needed for effective digital marketing campaigns.',
    paragraph1: 'This course is designed to help beginners understand the fundamentals of digital marketing.',
    paragraph2: 'You will learn about various digital marketing channels and how to create effective campaigns.',
    paragraph3: 'By the end of this course, you will be able to develop and implement your own digital marketing strategy.',
    course_exp: 1500,
    tags: ['marketing', 'digital', 'social media', 'SEO'],
    difficulty: 'Intermediate',
    sections: [
      {
        id: 1,
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the core concepts and principles of digital marketing.',
        isCompleted: true
      },
      {
        id: 2,
        title: 'Content Marketing Strategy',
        description: 'Develop effective content marketing strategies that drive engagement and conversions.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Social Media Marketing',
        description: 'Master social media marketing tactics for major platforms.',
        isCompleted: false
      },
      {
        id: 4,
        title: 'Search Engine Optimization',
        description: 'Learn how to optimize your content for search engines.',
        isCompleted: false
      }
    ]
  };

  useEffect(() => {
    // Simulate API fetch
    const fetchCourseData = () => {
      // In a real app, this would be an API call
      const courseId = route.params?.courseId;
      
      // For tutorial course
      if (courseId === '1') {
        setTimeout(() => {
          setCourseData(tymelyneTutorialData);
          setLoading(false);
        }, 500);
        return;
      }
      
      // For other courses, use existing mock data
      setTimeout(() => {
        setCourseData(mockCourseData);
        setLoading(false);
      }, 500);
    };

    fetchCourseData();
  }, [route.params?.courseId]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSectionPress = (sectionId) => {
    navigation.navigate('SectionContent', { 
      courseId: courseData.course_id,
      sectionId: sectionId,
      sectionData: courseData.sections.find(section => section.id === sectionId),
      courseData: courseData
    });
  };

  // Render a tag pill
  const renderTag = (tag, index) => (
    <View key={index} style={styles.tagContainer}>
      <Typography variant="caption" color="secondary" style={styles.tagText}>
        {tag}
      </Typography>
    </View>
  );

  if (loading) {
    return (
      <Screen
        title="Course"
        onBackPress={handleBackPress}
        backgroundColor={colors.background}
        showBottomNav={false}
      >
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="secondary">
            Loading course details...
          </Typography>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={courseData.course_name}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      {/* Course Header */}
      <View style={styles.courseHeader}>
        <Typography variant="heading" weight="bold" style={styles.courseTitle}>
          {courseData.course_name}
        </Typography>
        
        <Typography variant="body" style={styles.courseDescription}>
          {courseData.description}
        </Typography>
        
        {/* Course Metadata */}
        <Card variant="elevated" style={styles.metadataCard}>
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
              <Typography variant="caption" color="secondary" style={styles.metadataText}>
                {courseData.course_exp} XP
              </Typography>
            </View>
            
            <View style={styles.metadataItem}>
              <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
              <Typography variant="caption" color="secondary" style={styles.metadataText}>
                {courseData.difficulty}
              </Typography>
            </View>
            
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Typography variant="caption" color="secondary" style={styles.metadataText}>
                {new Date(courseData.created_at).toLocaleDateString()}
              </Typography>
            </View>
          </View>
        </Card>
        
        {/* Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tagsScrollView}
          contentContainerStyle={styles.tagsContainer}
        >
          {courseData.tags.map(renderTag)}
        </ScrollView>
      </View>

      {/* Course Content */}
      <SectionTitle title="Course Content" />
      
      {courseData.sections && courseData.sections.length > 0 ? (
        courseData.sections.map((section) => (
          <Card
            key={section.id}
            variant="elevated"
            style={styles.sectionCard}
            onPress={() => handleSectionPress(section.id)}
          >
            <Typography variant="subheading" weight="semiBold" style={styles.sectionTitle}>
              {section.title}
            </Typography>
            
            <Typography variant="body2" color="secondary" style={styles.sectionDescription} numberOfLines={3}>
              {section.description}
            </Typography>
            
            {section.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                <Typography variant="caption" color={colors.status.success} style={styles.completedText}>
                  Completed
                </Typography>
              </View>
            )}
          </Card>
        ))
      ) : (
        <Card variant="outlined" style={styles.sectionCard}>
          <Typography variant="body" style={styles.noContentMessage} center>
            No course content available yet.
          </Typography>
        </Card>
      )}
      
      {/* Course Overview Section */}
      <SectionTitle title="Course Overview" />
      <Card variant="elevated" style={styles.overviewCard}>
        <Typography variant="body" style={styles.paragraphText}>
          {courseData.paragraph1}
        </Typography>
        
        {courseData.paragraph2 && (
          <Typography variant="body" style={styles.paragraphText}>
            {courseData.paragraph2}
          </Typography>
        )}
        
        {courseData.paragraph3 && (
          <Typography variant="body" style={styles.paragraphText}>
            {courseData.paragraph3}
          </Typography>
        )}
        
        <Button 
          variant="primary"
          style={styles.startButton}
          onPress={() => handleSectionPress(courseData.sections[0].id)}
        >
          Begin Course
        </Button>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  metadataCard: {
    width: '100%',
    marginBottom: spacing.m,
    ...shadows.small,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  metadataText: {
    marginLeft: spacing.xs,
  },
  tagsScrollView: {
    maxHeight: 40,
    marginTop: spacing.xs,
  },
  tagsContainer: {
    paddingHorizontal: spacing.xs,
  },
  tagContainer: {
    backgroundColor: colors.cardDark,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
    marginHorizontal: spacing.xs,
  },
  tagText: {
    fontSize: 12,
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
    marginVertical: spacing.m,
  },
  overviewCard: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.xl,
    padding: spacing.m,
  },
  paragraphText: {
    marginBottom: spacing.m,
    lineHeight: 22,
  },
  startButton: {
    marginTop: spacing.s,
  }
});

export default CourseSectionsScreen; 