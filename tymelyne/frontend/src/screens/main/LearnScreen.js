import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

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
  
  // Mock data for learning paths
  const learningPaths = [
    {
      id: '1',
      title: 'Python Fundamentals',
      description: 'Learn the basics of Python programming',
      progress: 45,
      sections: 12,
      isNew: false,
    },
    {
      id: '2',
      title: 'React Native',
      description: 'Build cross-platform mobile apps',
      progress: 20,
      sections: 8,
      isNew: true,
    },
    {
      id: '3',
      title: 'Data Science',
      description: 'Introduction to data analysis and visualization',
      progress: 0,
      sections: 15,
      isNew: true,
    },
    {
      id: '4',
      title: 'Machine Learning',
      description: 'Learn the fundamentals of ML algorithms',
      progress: 0,
      sections: 10,
      isNew: false,
    },
  ];

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

  // Navigate to path details
  const navigateToPath = (pathId) => {
    navigation.navigate('LearnPath', { pathId });
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
        {learningPaths.map((_, index) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Learning Paths Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learning Paths</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => console.log('Add new learning path')}
            >
              <Ionicons name="add-circle" size={24} color={accentColor} />
              <Text style={[styles.addButtonText, { color: accentColor }]}>New</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pathCardsContainer}>
            <Animated.FlatList
              data={learningPaths}
              renderItem={renderPathItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={width - 40}
              decelerationRate="fast"
              contentContainerStyle={styles.pathCardsContent}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
            
            {renderPaginationDots()}
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
});

export default LearnScreen; 