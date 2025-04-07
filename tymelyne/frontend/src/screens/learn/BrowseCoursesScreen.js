import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * BrowseCoursesScreen - Shows available courses organized by categories
 */
const BrowseCoursesScreen = () => {
  const navigation = useNavigation();
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Selected category (null means show all categories)
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Mock course categories
  const categories = [
    { id: 'tech', name: 'Technology', icon: 'laptop-outline' },
    { id: 'marketing', name: 'Marketing', icon: 'megaphone-outline' },
    { id: 'finance', name: 'Finance', icon: 'cash-outline' },
    { id: 'soft-skills', name: 'Soft Skills', icon: 'people-outline' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-outline' },
    { id: 'languages', name: 'Languages', icon: 'language-outline' },
    { id: 'design', name: 'Design', icon: 'color-palette-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
  ];
  
  // Mock courses for each category
  const courses = {
    'tech': [
      {
        id: 'web-dev-101',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript basics',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '4 weeks',
      },
      {
        id: 'python-advanced',
        title: 'Advanced Python Programming',
        description: 'Master Python with advanced concepts and patterns',
        image: require('../../../assets/python-logo.png'),
        difficulty: 'Advanced',
        duration: '8 weeks',
      },
      {
        id: 'data-science-intro',
        title: 'Introduction to Data Science',
        description: 'Learn the basics of data analysis and visualization',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Intermediate',
        duration: '6 weeks',
      },
    ],
    'marketing': [
      {
        id: 'digital-marketing',
        title: 'Digital Marketing Essentials',
        description: 'Master the fundamentals of online marketing',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '3 weeks',
      },
      {
        id: 'seo-master',
        title: 'SEO Mastery',
        description: 'Learn to optimize websites for search engines',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Intermediate',
        duration: '4 weeks',
      },
    ],
    'finance': [
      {
        id: 'personal-finance',
        title: 'Personal Finance 101',
        description: 'Learn to manage your money effectively',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '3 weeks',
      },
      {
        id: 'investment-basics',
        title: 'Investment Fundamentals',
        description: 'Start your journey into smart investing',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '5 weeks',
      },
    ],
    'soft-skills': [
      {
        id: 'communication',
        title: 'Effective Communication',
        description: 'Improve your communication in professional settings',
        image: require('../../../assets/default-course.png'),
        difficulty: 'All Levels',
        duration: '2 weeks',
      },
      {
        id: 'leadership',
        title: 'Leadership Skills',
        description: 'Develop your ability to lead teams effectively',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Intermediate',
        duration: '6 weeks',
      },
    ],
    'fitness': [
      {
        id: 'home-workout',
        title: 'Home Workout Essentials',
        description: 'Stay fit with minimal equipment at home',
        image: require('../../../assets/default-course.png'),
        difficulty: 'All Levels',
        duration: '4 weeks',
      },
      {
        id: 'nutrition-basics',
        title: 'Nutrition Fundamentals',
        description: 'Learn the basics of healthy eating',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '3 weeks',
      },
    ],
    'languages': [
      {
        id: 'spanish-basics',
        title: 'Spanish for Beginners',
        description: 'Learn essential Spanish vocabulary and grammar',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '8 weeks',
      },
      {
        id: 'french-conversation',
        title: 'French Conversation Skills',
        description: 'Improve your French speaking abilities',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Intermediate',
        duration: '6 weeks',
      },
    ],
    'design': [
      {
        id: 'ui-design',
        title: 'UI Design Fundamentals',
        description: 'Learn to create beautiful user interfaces',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '5 weeks',
      },
      {
        id: 'graphic-design',
        title: 'Graphic Design Principles',
        description: 'Master the basics of visual design',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '4 weeks',
      },
    ],
    'education': [
      {
        id: 'learning-strategies',
        title: 'Effective Learning Strategies',
        description: 'Learn how to learn more efficiently',
        image: require('../../../assets/default-course.png'),
        difficulty: 'All Levels',
        duration: '2 weeks',
      },
      {
        id: 'teaching-basics',
        title: 'Teaching Fundamentals',
        description: 'Learn the basics of effective teaching',
        image: require('../../../assets/default-course.png'),
        difficulty: 'Beginner',
        duration: '4 weeks',
      },
    ],
  };
  
  // Handle category selection
  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
  // Handle course selection
  const handleCoursePress = (course) => {
    // Navigate to course overview
    navigation.navigate('CourseOverview', {
      courseId: course.id,
      title: course.title,
    });
  };
  
  // Render a category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && { borderColor: accentColor, borderWidth: 2 }
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.id ? accentColor : '#fff'} 
      />
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && { color: accentColor }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Render a course item
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => handleCoursePress(item)}
    >
      <Image 
        source={item.image}
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription}>{item.description}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.courseDetailItem}>
            <Ionicons name="time-outline" size={14} color="#aaa" />
            <Text style={styles.courseDetailText}>{item.duration}</Text>
          </View>
          <View style={styles.courseDetailItem}>
            <Ionicons name="bar-chart-outline" size={14} color="#aaa" />
            <Text style={styles.courseDetailText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render courses section for a specific category
  const renderCategorySection = (categoryId) => {
    const categoryData = categories.find(cat => cat.id === categoryId);
    const categoryCourses = courses[categoryId] || [];
    
    return (
      <View style={styles.categorySection} key={categoryId}>
        <View style={styles.categorySectionHeader}>
          <Ionicons name={categoryData.icon} size={24} color={accentColor} />
          <Text style={styles.categorySectionTitle}>{categoryData.name}</Text>
        </View>
        
        <FlatList
          data={categoryCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coursesListContent}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Courses</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Categories section */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {/* Main content */}
      <ScrollView style={styles.scrollView}>
        {/* Show selected category or all categories */}
        {selectedCategory ? (
          renderCategorySection(selectedCategory)
        ) : (
          categories.map(category => renderCategorySection(category.id))
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 30, // To balance the header
  },
  categoriesContainer: {
    marginVertical: 15,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  categoryName: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 25,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  coursesListContent: {
    paddingHorizontal: 15,
  },
  courseItem: {
    backgroundColor: '#333',
    borderRadius: 15,
    marginHorizontal: 8,
    width: 280,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#444',
  },
  courseInfo: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseDetailText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 5,
  },
});

export default BrowseCoursesScreen; 