import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Modal,
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
    description: 'course description',
    image: require('../../../assets/python-logo.png'),
    modules: [],
    progress: 0,
    timeToComplete: '4-6 hours'
  };
}

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * LearnScreen - Shows available courses and learning progress
 */
const LearnScreen = () => {
  const navigation = useNavigation();
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  
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

  // Define built-in courses
  const builtInCourses = [
    {
      id: pythonCourse.id || 'python-101',
      title: pythonCourse.title || 'Python Programming',
      image: pythonCourse.image || require('../../../assets/python-logo.png'),
      description: pythonCourse.description || 'Learn Python programming from basics to advanced concepts',
      modules: pythonCourse.modules?.length || 6,
      progress: pythonCourse.progress || 0,
      category: 'Programming',
    },
    {
      id: 'javascript-101',
      title: 'JavaScript Basics',
      image: require('../../../assets/javascript-logo.png'),
      description: 'Introduction to JavaScript programming',
      modules: 5,
      progress: 0,
      category: 'Programming',
    },
    {
      id: 'react-native-101',
      title: 'React Native',
      image: require('../../../assets/react-native-logo.png'),
      description: 'Build mobile apps with React Native',
      modules: 8,
      progress: 0,
      category: 'Mobile Development',
    }
  ];

  // All courses (built-in + generated)
  const allCourses = [...builtInCourses, ...generatedCourses];
  
  // Calculate days streak (just for display)
  const daysStreak = 7;

  // Handle course selection
  const handleCoursePress = (course) => {
    if (!course) return;
    
    navigation.navigate('CourseOverview', {
      courseId: course.id,
      title: course.title,
    });
  };

  // Add course button handler
  const handleAddCourse = () => {
    setShowAddCourseModal(true);
  };

  // Create AI course handler
  const handleCreateAICourse = () => {
    setShowAddCourseModal(false);
    navigation.navigate('CourseCreator');
  };

  // Render a course card
  const renderCourseCard = (course) => {
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
      // Fallback to default image
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
          
          <View style={styles.courseProgressContainer}>
            <View style={styles.courseProgressBg}>
              <View 
                style={[
                  styles.courseProgress, 
                  { 
                    width: `${course.progress || 0}%`,
                    backgroundColor: accentColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.courseProgressText}>{course.progress || 0}% Complete</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Add Course Modal
  const renderAddCourseModal = () => (
    <Modal
      visible={showAddCourseModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddCourseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add a Course</Text>
            <TouchableOpacity 
              onPress={() => setShowAddCourseModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalOptions}>
            <TouchableOpacity 
              style={[styles.modalOption, { borderColor: accentColor }]}
              onPress={() => {
                setShowAddCourseModal(false);
                // Navigate to our new BrowseCoursesScreen
                navigation.navigate('BrowseCourses');
              }}
            >
              <Ionicons name="book-outline" size={32} color={accentColor} />
              <Text style={styles.optionTitle}>Browse Courses</Text>
              <Text style={styles.optionDescription}>
                Explore our collection of premade courses
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, { borderColor: accentColor }]}
              onPress={handleCreateAICourse}
            >
              <Ionicons name="sparkles-outline" size={32} color={accentColor} />
              <Text style={styles.optionTitle}>AI-Generated Course</Text>
              <Text style={styles.optionDescription}>
                Create a personalized course using AI
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView style={styles.scrollView}>
        {/* Streak Banner */}
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color={accentColor} />
          <Text style={styles.streakText}>
            {daysStreak} day streak! Keep it up!
          </Text>
        </View>
        
        {/* Continue Learning Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CONTINUE</Text>
          
          {allCourses.length > 0 && allCourses.some(course => course.progress > 0) ? (
            <FlatList
              data={allCourses.filter(course => course.progress > 0)}
              renderItem={({ item }) => renderCourseCard(item)}
              keyExtractor={(item) => item.id}
              horizontal={false}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>
              No courses in progress. Start a new course below.
            </Text>
          )}
        </View>
        
        {/* Your Courses Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>YOUR COURSES</Text>
          
          {allCourses.length > 0 ? (
            <FlatList
              data={allCourses}
              renderItem={({ item }) => renderCourseCard(item)}
              keyExtractor={(item) => item.id}
              horizontal={false}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>
              You don't have any courses yet. Add a course to get started.
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Add Button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: accentColor }]}
        onPress={handleAddCourse}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      
      {/* Add Course Modal */}
      {renderAddCourseModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  streakText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  courseCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 10,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  courseDescription: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 8,
  },
  courseProgressContainer: {
    marginTop: 5,
  },
  courseProgressBg: {
    height: 5,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
  },
  courseProgress: {
    height: '100%',
    borderRadius: 3,
  },
  courseProgressText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 5,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    padding: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalOptions: {
    padding: 20,
  },
  modalOption: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  optionDescription: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default LearnScreen; 