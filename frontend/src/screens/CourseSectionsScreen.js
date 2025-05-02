import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Typography from '../components/Typography';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadows, deviceInfo } from '../constants/theme';
import { tymelyneTutorialData } from '../data/tutorialData';
import { getCourseById } from '../services/courseService';

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
    const fetchCourseData = async () => {
      setLoading(true);
      
      // First check if we have updated progression data from quiz completion
      if (route.params?.updatedProgressData) {
        // Store the updated progression data
        console.log('Using updated progression data from quiz:', route.params.updatedProgressData);
      }
      
      // Use courseData from params if available (highest priority)
      const passedCourseData = route.params?.courseData;
      
      // If this is a mock course with a specific courseType
      if (route.params?.courseType === 'mock') {
        console.log('Using mock course data for demo purposes');
        setCourseData(mockCourseData);
        setLoading(false);
        return;
      }
      
      // If course data is passed from previous screen, use it directly
      if (passedCourseData) {
        console.log('Using passed course data:', passedCourseData);
        console.log('Course ID types:', { 
          _id: passedCourseData._id, 
          course_id: passedCourseData.course_id,
        });
        console.log('First section format:', passedCourseData.sections[0]);
        setCourseData(passedCourseData);
        setLoading(false);
        return;
      }
      
      // If we have a courseId but no data, try to fetch from API
      if (route.params?.courseId) {
        try {
          const courseResponse = await getCourseById(route.params.courseId);
          if (courseResponse) {
            console.log(`Fetched course data for ${route.params.courseId} from API:`, {
              title: courseResponse.title,
              sections: courseResponse.sections.length
            });
            setCourseData(courseResponse);
            
            // Save this in route params to have it available after navigation
            if (navigation.setParams) {
              navigation.setParams({ courseData: courseResponse });
            }
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error(`Failed to fetch course ${route.params.courseId} from API:`, error);
          
          // If we have courseData somewhere in the route hierarchy, use it
          if (route.params?.course) {
            console.log('Using course data from route.params.course');
            setCourseData(route.params.course);
            setLoading(false);
            return;
          }
          
          // Continue to fallback
        }
      }
      
      // Otherwise, use the mock data for now
      console.log('No course data available, using mock data for course ID:', route.params?.courseId);
      setCourseData(mockCourseData);
      setLoading(false);
    };

    fetchCourseData();
  }, [route.params?.courseId, route.params?.courseData, route.params?.refreshTimestamp, navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSectionPress = (section) => {
    // Pass the entire section object instead of just the ID
    // Use _id if available (MongoDB format) or id as fallback (mock data format)
    navigation.navigate('SectionContent', { 
      courseId: courseData._id || courseData.course_id,
      sectionId: section._id || section.id,
      section: section,
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

  // Calculate course progress percentage
  const calculateCourseProgress = () => {
    if (!courseData.sections || courseData.sections.length === 0) return 0;
    
    const completedSections = courseData.sections.filter(section => section.isCompleted).length;
    return Math.round((completedSections / courseData.sections.length) * 100);
  };

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
      title={courseData.title || courseData.course_name}
      onBackPress={handleBackPress}
      backgroundColor={colors.background}
      showBottomNav={false}
      scrollable={true}
    >
      {/* Course Header */}
      <View style={styles.courseHeader}>
        {/* Course Metadata - Moved to the top */}
        <Card variant="elevated" style={styles.metadataCard}>
          <View style={styles.metadataRow}>
            {/* Course Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={
                  courseData.icon || 
                  (courseData.courseData && courseData.courseData.icon) ||
                  require('../../assets/course-icons/computer.png')
                } 
                style={styles.courseLogo}
                resizeMode="contain"
              />
            </View>
            
            {/* Course Metadata - Wrapped in a ScrollView for small screens */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.metadataScrollContent}
            >
              <View style={styles.metadataContainer}>
                <View style={styles.metadataItem}>
                  <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                  <Typography variant="caption" color="secondary" style={styles.metadataText}>
                    {courseData.course_exp || 500} XP
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
            </ScrollView>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Typography variant="caption" color="secondary">
                Course Progress
              </Typography>
              <Typography variant="caption" color="secondary">
                {calculateCourseProgress()}%
              </Typography>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${calculateCourseProgress()}%` }
                ]} 
              />
            </View>
          </View>
        </Card>
        
        {/* Description Subheader */}
        <Typography variant="subheading" weight="semiBold" style={styles.descriptionHeader}>
          Description:
        </Typography>
        
        <Typography variant="body" style={styles.courseDescription}>
          {courseData.description}
        </Typography>
        
        {/* Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tagsScrollView}
          contentContainerStyle={styles.tagsContainer}
        >
          {(courseData.tags || []).map(renderTag)}
        </ScrollView>
      </View>

      {/* Course Content */}
      <SectionTitle title="Course Content" style={styles.contentTitle} />
      
      {courseData.sections && courseData.sections.length > 0 ? (
        courseData.sections.map((section) => (
          <Card
            key={section._id || section.id}
            variant="elevated"
            style={styles.sectionCard}
            onPress={() => handleSectionPress(section)}
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
    alignItems: 'flex-start',
    marginVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  courseTitle: {
    marginBottom: spacing.s,
  },
  courseDescription: {
    marginBottom: spacing.m,
  },
  descriptionHeader: {
    marginTop: spacing.m,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
    color: colors.text.primary,
  },
  metadataCard: {
    width: '100%',
    marginBottom: spacing.m,
    ...shadows.small,
    padding: spacing.s,
  },
  metadataRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.m,
  },
  logoContainer: {
    marginRight: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  courseLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.cardDark,
  },
  metadataScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs / 2,
    marginRight: spacing.m,
  },
  metadataText: {
    marginLeft: spacing.xs,
  },
  tagsScrollView: {
    maxHeight: 40,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  tagsContainer: {
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
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
  },
  contentTitle: {
    paddingHorizontal: spacing.m,
    alignItems: 'flex-start',
  },
  progressContainer: {
    width: '100%',
    marginTop: 0,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs / 2,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.cardDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default CourseSectionsScreen; 