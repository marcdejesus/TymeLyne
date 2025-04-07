import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getGeneratedCourseById } from '../../services/courseStorage';

// Import Python course data with a fallback
let pythonCourse;
try {
  pythonCourse = require('../../data/pythonCourse').default;
} catch (error) {
  console.warn('Python course data not found:', error.message);
  // Fallback data structure
  pythonCourse = {
    id: 'python101',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch',
    timeToComplete: '4-6 hours',
    modules: [],
    progress: 0,
    xpReward: 1000,
    author: 'Tymelyne Team',
    goals: [
      'Write Python code with proper syntax',
      'Understand and use different data types', 
      'Create and use functions'
    ],
    image: require('../../../assets/python-logo.png')
  };
}

const CourseOverviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dark, accent } = useTheme();
  const { width } = useWindowDimensions();

  // Animation values
  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 70],
    extrapolate: 'clamp',
  });

  // Get course ID from route params
  const { courseId } = route.params || {};
  
  // State for course data
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      
      try {
        // First check if it's an AI-generated course
        const generatedCourse = await getGeneratedCourseById(courseId);
        
        if (generatedCourse) {
          setCourseData(generatedCourse);
        } else {
          // If not found in generated courses, use the built-in course
          setCourseData(pythonCourse);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        // Fallback to built-in Python course
        setCourseData(pythonCourse);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);
  
  // Calculate overall progress
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Calculate overall course progress
  useEffect(() => {
    if (courseData) {
      setOverallProgress(courseData.progress || 0);
    }
  }, [courseData]);

  // Navigate to module
  const navigateToModule = (module, index) => {
    navigation.navigate('ModuleDetail', {
      moduleId: module.id,
      moduleTitle: module.title,
      moduleIndex: index + 1,
    });
  };

  // Render module card
  const renderModuleCard = (module, index) => {
    // Calculate module progress based on activities completed
    const moduleProgress = 0; // In a real app, this would be calculated from user data
    
    // Calculate total activities
    const totalActivities = module.activities ? module.activities.length : 0;
    
    return (
      <TouchableOpacity
        key={module.id}
        style={styles.moduleCard}
        onPress={() => navigateToModule(module, index)}
      >
        <View style={styles.moduleHeader}>
          <View style={styles.moduleNumberContainer}>
            <Text style={styles.moduleNumber}>{index + 1}</Text>
          </View>
          <View style={styles.moduleTitleContainer}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
          </View>
        </View>
        
        <View style={styles.moduleProgressContainer}>
          <View style={styles.moduleProgressBar}>
            <View 
              style={[
                styles.moduleProgressFill, 
                { width: `${moduleProgress}%`, backgroundColor: accent }
              ]} 
            />
          </View>
          <Text style={styles.moduleProgressText}>
            {moduleProgress}% • {totalActivities} activities
          </Text>
        </View>
        
        <View style={styles.moduleFooter}>
          <View style={styles.moduleActivities}>
            {module.activities && module.activities.map((activity, actIndex) => (
              <View 
                key={`activity-${actIndex}`}
                style={[
                  styles.activityDot,
                  { backgroundColor: actIndex === 0 ? accent : '#444' }
                ]}
              />
            ))}
          </View>
          <View style={styles.moduleStart}>
            <Text style={[styles.moduleStartText, { color: accent }]}>
              {moduleProgress > 0 ? 'Continue' : 'Start'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={accent} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={styles.loadingText}>Loading course content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          { height: headerHeight }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Handle image with try/catch for robustness */}
        {(() => {
          let imageSource;
          try {
            imageSource = typeof courseData.image === 'string' 
              ? require('../../../assets/python-logo.png')
              : courseData.image;
          } catch (error) {
            console.warn('Error loading course image:', error);
            imageSource = require('../../../assets/python-logo.png');
          }
          
          return (
            <Image 
              source={imageSource}
              style={styles.courseImage}
              resizeMode="contain"
            />
          );
        })()}
        
        <Animated.Text 
          style={[
            styles.courseTitle,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 100, 200],
                outputRange: [1, 0.5, 0],
                extrapolate: 'clamp',
              })
            }
          ]}
        >
          {courseData.title}
        </Animated.Text>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.courseInfo}>
          <Text style={styles.courseDescription}>{courseData.description}</Text>
          
          <View style={styles.courseStats}>
            <View style={styles.courseStat}>
              <Ionicons name="time-outline" size={20} color="#999" />
              <Text style={styles.courseStatText}>{courseData.timeToComplete}</Text>
            </View>
            <View style={styles.courseStat}>
              <Ionicons name="trophy-outline" size={20} color="#999" />
              <Text style={styles.courseStatText}>{courseData.xpReward} XP</Text>
            </View>
            <View style={styles.courseStat}>
              <Ionicons name="person-outline" size={20} color="#999" />
              <Text style={styles.courseStatText}>{courseData.author}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercent}>{overallProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${overallProgress}%`, backgroundColor: accent }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Goals</Text>
          <View style={styles.goalsList}>
            {courseData.goals && courseData.goals.map((goal, index) => (
              <View key={`goal-${index}`} style={styles.goalItem}>
                <Ionicons name="checkmark-circle" size={20} color={accent} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          <Text style={styles.contentDescription}>
            Complete all modules in order to master {courseData.title}.
          </Text>
          
          <View style={styles.modulesList}>
            {courseData.modules && courseData.modules.map((module, index) => 
              renderModuleCard(module, index)
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Progress</Text>
          <TouchableOpacity 
            style={[styles.progressButton, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('CourseProgress', { courseId: courseData.id })}
          >
            <Text style={styles.progressButtonText}>View Detailed Progress</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'flex-end',
    padding: 15,
    paddingBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImage: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 80,
    height: 80,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  courseInfo: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  courseDescription: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
    lineHeight: 24,
  },
  courseStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  courseStatText: {
    marginLeft: 5,
    color: '#999',
  },
  progressContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  goalsList: {
    marginBottom: 10,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 16,
  },
  contentDescription: {
    color: '#999',
    marginBottom: 20,
  },
  modulesList: {
    gap: 15,
  },
  moduleCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  moduleNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moduleNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  moduleTitleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  moduleDescription: {
    color: '#999',
    fontSize: 14,
  },
  moduleProgressContainer: {
    marginBottom: 15,
  },
  moduleProgressBar: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  moduleProgressText: {
    color: '#999',
    fontSize: 12,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleActivities: {
    flexDirection: 'row',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  moduleStart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleStartText: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  progressButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  progressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
});

export default CourseOverviewScreen; 