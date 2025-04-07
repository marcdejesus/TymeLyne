import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getGeneratedCourses } from '../../services/courseStorage';
// Import with try/catch to handle potential missing file
let pythonCourse;
try {
  pythonCourse = require('../../data/pythonCourse').default;
} catch (error) {
  console.warn('Python course data not found:', error.message);
  // Fallback default course data
  pythonCourse = {
    id: 'python101',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch',
    image: require('../../../assets/python-logo.png'),
    modules: [],
    progress: 0,
    timeToComplete: '4-6 hours'
  };
}

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * LearnScreen - Shows available learning paths and progress
 */
const LearnScreen = () => {
  const navigation = useNavigation();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  // Make sure pythonCourse is defined and has required properties
  const safePythonCourse = pythonCourse || {
    id: 'python101',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch',
    image: require('../../../assets/python-logo.png'),
    modules: [],
    progress: 0,
    timeToComplete: '4-6 hours'
  };
  
  // Define courses
  const courses = [
    {
      id: safePythonCourse.id || 'python-101',
      title: safePythonCourse.title || 'Python Programming',
      image: safePythonCourse.image || require('../../../assets/python-logo.png'),
      description: safePythonCourse.description || 'Learn Python programming from basics to advanced concepts',
      modules: safePythonCourse.modules?.length || 6,
      progress: safePythonCourse.progress || 10,
    },
    {
      id: 'javascript-101',
      title: 'JavaScript Basics',
      image: require('../../../assets/javascript-logo.png'),
      description: 'Introduction to JavaScript programming',
      modules: 5,
      progress: 0
    },
    {
      id: 'react-native-101',
      title: 'React Native',
      image: require('../../../assets/react-native-logo.png'),
      description: 'Build mobile apps with React Native',
      modules: 8,
      progress: 0
    }
  ];
  
  // Calculate recommended course based on progress - use first course as fallback
  const recommendedCourse = courses[0];
  
  // Mock data for recent activity (simplified for demo)
  const recentActivity = [
    { id: '1', day: 'Mon', completed: 2 },
    { id: '2', day: 'Tue', completed: 4 },
    { id: '3', day: 'Wed', completed: 1 },
    { id: '4', day: 'Thu', completed: 3 },
    { id: '5', day: 'Fri', completed: 5 },
    { id: '6', day: 'Sat', completed: 2 },
    { id: '7', day: 'Sun', completed: 0 },
  ];

  const [generatedCourses, setGeneratedCourses] = useState([]);
  
  // Load generated courses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadGeneratedCourses = async () => {
        const courses = await getGeneratedCourses();
        setGeneratedCourses(courses);
      };
      
      loadGeneratedCourses();
    }, [])
  );

  // Navigate to path details
  const navigateToPath = (pathId) => {
    navigation.navigate('LearnPath', { pathId });
  };

  // Navigation handlers
  const handleCoursePress = (course) => {
    if (!course) {
      console.warn('Course is undefined in handleCoursePress');
      return;
    }
    
    if (course.id === safePythonCourse.id) {
      navigation.navigate('CourseOverview', {
        courseId: course.id,
        title: course.title,
      });
    } else {
      // For other courses, navigate to the module detail screen for now
      navigation.navigate('ModuleDetail', {
        moduleId: `${course.id}_module1`,
        moduleTitle: `Introduction to ${course.title}`,
        moduleIndex: 1,
      });
    }
  };

  // Render a learning path card
  const renderPathItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View style={[
        styles.pathCardContainer, 
        { 
          width: width - 40,
          transform: [{ scale }],
          opacity,
        }
      ]}>
        <TouchableOpacity
          style={styles.pathCard}
          onPress={() => navigateToPath(item.id)}
        >
          <View style={styles.pathCardHeader}>
            <Text style={styles.pathTitle}>{item.title}</Text>
            {item.isNew && (
              <View style={[styles.newBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.pathDescription}>{item.description}</Text>
          
          <View style={styles.pathCardFooter}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.progress}%`, backgroundColor: accentColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress}% Complete
              </Text>
            </View>
            
            <View style={styles.sectionsContainer}>
              <Text style={styles.sectionsText}>
                {item.sections} sections
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render recent activity item
  const renderActivityItem = ({ item }) => {
    // Maximum completed items we're expecting (for height calculation)
    const maxCompleted = 5;
    
    // Calculate height ratio (0.2 for each unit, so maxCompleted would be 1.0)
    const heightRatio = Math.min(item.completed / maxCompleted, 1);
    
    return (
      <View style={styles.activityItem}>
        <View style={styles.activityBarContainer}>
          <View 
            style={[
              styles.activityBar, 
              { 
                height: `${heightRatio * 100}%`,
                backgroundColor: item.completed > 0 ? accentColor : '#333'
              }
            ]} 
          />
        </View>
        <Text style={styles.activityDay}>{item.day}</Text>
      </View>
    );
  };
  
  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {courses.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scaleX = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  transform: [{ scaleX }],
                  opacity,
                  backgroundColor: accentColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render recommended course card
  const renderRecommendedCourse = () => {
    // Use image directly without dynamic require
    let imageSource;
    
    try {
      // If image is a string path, use require with the path
      if (typeof recommendedCourse.image === 'string') {
        imageSource = require('../../../assets/python-logo.png');
      } else {
        // Otherwise, use the image object directly
        imageSource = recommendedCourse.image;
      }
    } catch (error) {
      console.warn('Error loading image:', error);
      imageSource = require('../../../assets/python-logo.png');
    }
      
    return (
      <TouchableOpacity 
        style={[styles.recommendedCard, { borderColor: accent }]}
        onPress={() => handleCoursePress(recommendedCourse)}
      >
        <View style={styles.recommendedContent}>
          <View style={styles.recommendedInfo}>
            <Text style={styles.recommendedLabel}>RECOMMENDED</Text>
            <Text style={styles.recommendedTitle}>{recommendedCourse.title}</Text>
            <Text style={styles.recommendedDescription}>{recommendedCourse.description}</Text>
            
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${recommendedCourse.progress}%`,
                    backgroundColor: accent 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{recommendedCourse.progress}% Complete</Text>
            
            <TouchableOpacity 
              style={[styles.continueButton, { backgroundColor: accent }]}
              onPress={() => handleCoursePress(recommendedCourse)}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommendedImageContainer}>
            <Image 
              source={imageSource}
              style={styles.recommendedImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render course card
  const renderCourseCard = (course) => {
    // Use image directly without dynamic require
    let imageSource;
    
    try {
      // If image is a string path, use require with the path
      if (typeof course.image === 'string') {
        imageSource = require('../../../assets/python-logo.png');
      } else {
        // Otherwise, use the image object directly
        imageSource = course.image;
      }
    } catch (error) {
      console.warn('Error loading image:', error);
      imageSource = require('../../../assets/python-logo.png');
    }
      
    return (
      <TouchableOpacity 
        key={course.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
      >
        <Image 
          source={imageSource}
          style={styles.courseImage}
          resizeMode="contain"
        />
        
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          
          <View style={styles.courseDetails}>
            <Text style={styles.courseModules}>{course.modules} modules</Text>
            
            <View style={styles.courseProgressContainer}>
              <View style={styles.courseProgressBg}>
                <View 
                  style={[
                    styles.courseProgress, 
                    { 
                      width: `${course.progress}%`,
                      backgroundColor: accent 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.courseProgressText}>{course.progress}%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render generated course card
  const renderGeneratedCourseCard = (course) => {
    // Handle image source with try/catch for better error handling
    let imageSource;
    try {
      if (typeof course.image === 'string') {
        // Use a default image if the path is a string
        imageSource = require('../../../assets/python-logo.png');
      } else {
        // Use the image directly if it's an object (e.g., from require)
        imageSource = course.image;
      }
    } catch (error) {
      console.warn('Error loading course image:', error);
      // Fallback to default image
      imageSource = require('../../../assets/python-logo.png');
    }
      
    return (
      <TouchableOpacity 
        key={course.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
      >
        <View style={styles.generatedBadge}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <Text style={styles.generatedBadgeText}>AI-Generated</Text>
        </View>
        
        <Image 
          source={imageSource}
          style={styles.courseImage}
          resizeMode="contain"
        />
        
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          
          <View style={styles.courseDetails}>
            <Text style={styles.courseModules}>
              {course.modules?.length || 0} modules
            </Text>
            
            <View style={styles.courseProgressContainer}>
              <View style={styles.courseProgressBg}>
                <View 
                  style={[
                    styles.courseProgress, 
                    { 
                      width: `${course.progress || 0}%`,
                      backgroundColor: accent 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.courseProgressText}>{course.progress || 0}%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>What will you learn today?</Text>
          <TouchableOpacity 
            style={[styles.createCourseButton, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('CourseCreator')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.createCourseText}>Create Custom Course</Text>
          </TouchableOpacity>
        </View>
        
        {renderRecommendedCourse()}
        
        {/* Generated Courses Section - only shown if there are any */}
        {generatedCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your AI-Generated Courses</Text>
              <View style={[styles.newBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.newBadgeText}>AI</Text>
              </View>
            </View>
            
            <View style={styles.coursesList}>
              {generatedCourses.map(renderGeneratedCourseCard)}
            </View>
          </View>
        )}
        
        {/* New Course Section - Showcase the new learning flow */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Learning Path!</Text>
            <View style={[styles.newBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.newCourseCard, { borderColor: accent }]}
            onPress={() => navigation.navigate('CourseOverview', { 
              courseId: safePythonCourse.id,
              title: safePythonCourse.title 
            })}
          >
            <View style={styles.newCourseContent}>
              <View style={styles.newCourseImageContainer}>
                <Image 
                  source={require('../../../assets/python-logo.png')}
                  style={styles.newCourseImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.newCourseInfo}>
                <Text style={styles.newCourseTitle}>{safePythonCourse.title}</Text>
                <Text style={styles.newCourseDescription}>
                  Our redesigned course with interactive content and gamified learning!
                </Text>
                
                <View style={styles.newCourseBenefits}>
                  <View style={styles.newCourseBenefit}>
                    <Ionicons name="trophy-outline" size={16} color="#FFD700" />
                    <Text style={styles.newCourseBenefitText}>XP rewards</Text>
                  </View>
                  <View style={styles.newCourseBenefit}>
                    <Ionicons name="game-controller-outline" size={16} color="#2ECC71" />
                    <Text style={styles.newCourseBenefitText}>Gamified challenges</Text>
                  </View>
                  <View style={styles.newCourseBenefit}>
                    <Ionicons name="code-slash-outline" size={16} color="#3498DB" />
                    <Text style={styles.newCourseBenefitText}>Interactive coding</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.newCourseButton, { backgroundColor: accent }]}
                  onPress={() => navigation.navigate('CourseOverview', { 
                    courseId: safePythonCourse.id,
                    title: safePythonCourse.title 
                  })}
                >
                  <Text style={styles.newCourseButtonText}>Start Learning</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Courses</Text>
          </View>
          
          <View style={styles.coursesList}>
            {courses.map(renderCourseCard)}
          </View>
        </View>
        
        {/* Activity Tracking Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: accentColor }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityContainer}>
            <FlatList
              data={recentActivity}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityContent}
            />
          </View>
          
          <View style={styles.streakContainer}>
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={24} color={accentColor} />
              <Text style={styles.streakText}>Current streak: 5 days</Text>
            </View>
            <TouchableOpacity style={[styles.streakButton, { backgroundColor: accentColor }]}>
              <Text style={styles.streakButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recommended Paths Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </View>
          
          <View style={styles.recommendedContainer}>
            <TouchableOpacity 
              style={styles.recommendedItem}
              onPress={() => navigateToPath('3')}
            >
              <View style={styles.recommendedIcon}>
                <Ionicons name="analytics" size={24} color="#fff" />
              </View>
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedTitle}>Data Science</Text>
                <Text style={styles.recommendedDescription}>Recommended based on your activity</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.recommendedItem}
              onPress={() => navigateToPath('2')}
            >
              <View style={[styles.recommendedIcon, { backgroundColor: '#3498db' }]}>
                <Ionicons name="phone-portrait" size={24} color="#fff" />
              </View>
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedTitle}>React Native</Text>
                <Text style={styles.recommendedDescription}>Popular in your region</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  viewAllButton: {},
  viewAllText: {
    fontWeight: 'bold',
  },
  pathCardsContainer: {
    height: 200,
  },
  pathCardsContent: {
    paddingHorizontal: 20,
  },
  pathCardContainer: {
    marginHorizontal: 10,
  },
  pathCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    flex: 1,
  },
  pathCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pathTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pathDescription: {
    color: '#ccc',
    marginBottom: 15,
  },
  pathCardFooter: {
    marginTop: 'auto',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
  },
  sectionsContainer: {},
  sectionsText: {
    color: '#999',
    fontSize: 12,
  },
  activityContainer: {
    height: 120,
    marginBottom: 15,
  },
  activityContent: {
    paddingHorizontal: 20,
  },
  activityItem: {
    alignItems: 'center',
    marginRight: 15,
    height: '100%',
  },
  activityBarContainer: {
    height: 80,
    width: 30,
    backgroundColor: '#333',
    borderRadius: 15,
    justifyContent: 'flex-end',
    marginBottom: 5,
    overflow: 'hidden',
  },
  activityBar: {
    width: '100%',
    borderRadius: 15,
  },
  activityDay: {
    color: '#999',
    fontSize: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  streakButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recommendedContainer: {
    paddingHorizontal: 20,
  },
  recommendedItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  recommendedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendedDescription: {
    color: '#999',
    fontSize: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  recommendedCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    borderWidth: 2,
    padding: 20,
    marginBottom: 30,
  },
  recommendedContent: {
    flexDirection: 'row',
  },
  recommendedLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  recommendedImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedImage: {
    width: 120,
    height: 120,
  },
  coursesList: {
    gap: 20,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  courseImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  courseDescription: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseModules: {
    color: '#999',
    fontSize: 13,
  },
  courseProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseProgressBg: {
    width: 50,
    height: 6,
    backgroundColor: '#3A3A3A',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  courseProgress: {
    height: '100%',
    borderRadius: 3,
  },
  courseProgressText: {
    color: '#999',
    fontSize: 12,
  },
  newCourseCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    marginBottom: 15,
  },
  newCourseContent: {
    flexDirection: 'row',
  },
  newCourseImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  newCourseImage: {
    width: 80,
    height: 80,
  },
  newCourseInfo: {
    flex: 1,
  },
  newCourseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  newCourseDescription: {
    fontSize: 14,
    color: '#DDDDDD',
    marginBottom: 12,
  },
  newCourseBenefits: {
    marginBottom: 16,
  },
  newCourseBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  newCourseBenefitText: {
    color: '#CCCCCC',
    marginLeft: 8,
    fontSize: 14,
  },
  newCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newCourseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  createCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  createCourseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  generatedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  generatedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LearnScreen; 