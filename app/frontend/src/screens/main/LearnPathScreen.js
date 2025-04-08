import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * LearnPathScreen - Shows details of a specific learning path
 */
const LearnPathScreen = ({ route }) => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const { width } = useWindowDimensions();
  const routeParams = route.params;
  
  // Safely access route.params with default values
  const pathId = routeParams?.pathId || '1';
  
  // Get the theme accent color with fallback
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({});
  
  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections({
      ...expandedSections,
      [sectionId]: !expandedSections[sectionId]
    });
  };
  
  // Mock data for the selected path (would be fetched based on pathId in a real app)
  const pathData = {
    id: pathId,
    title: pathId === '1' ? 'Python Fundamentals' : 
           pathId === '2' ? 'React Native' : 
           pathId === '3' ? 'Data Science' : 'Machine Learning',
    description: 'Learn the core concepts and build your skills through interactive exercises and projects.',
    progress: pathId === '1' ? 45 : 
              pathId === '2' ? 20 : 0,
    sections: [
      {
        id: 's1',
        title: 'Getting Started',
        completed: true,
        modules: [
          { 
            id: 'm1', 
            title: 'Introduction to Python', 
            description: 'Overview of Python and its applications',
            completed: true,
            progress: 100,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          },
          { 
            id: 'm2', 
            title: 'Setting Up Your Environment', 
            description: 'Install Python and setup your development environment',
            completed: true,
            progress: 100,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          }
        ]
      },
      {
        id: 's2',
        title: 'Core Concepts',
        completed: pathId === '1',
        modules: [
          { 
            id: 'm3', 
            title: 'Variables and Data Types', 
            description: 'Learn about different data types in Python',
            completed: pathId === '1',
            progress: pathId === '1' ? 100 : 0,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          },
          { 
            id: 'm4', 
            title: 'Control Flow', 
            description: 'Conditional statements and loops',
            completed: false,
            progress: 60,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          }
        ]
      },
      {
        id: 's3',
        title: 'Advanced Topics',
        completed: false,
        modules: [
          { 
            id: 'm5', 
            title: 'Functions and Modules', 
            description: 'Creating reusable code with functions and modules',
            completed: false,
            progress: 0,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          },
          { 
            id: 'm6', 
            title: 'Object-Oriented Programming', 
            description: 'Classes, objects, inheritance, and polymorphism',
            completed: false,
            progress: 0,
            image: 'https://reactnative.dev/img/tiny_logo.png'
          }
        ]
      }
    ]
  };
  
  // Calculate path progress
  const totalLessons = pathData.sections.reduce((count, section) => 
    count + section.modules.length, 0);
  
  const completedLessons = pathData.sections.reduce((count, section) => 
    count + section.modules.filter(module => module.completed).length, 0);
  
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  
  // Get icon for lesson type
  const getLessonTypeIcon = (type) => {
    switch(type) {
      case 'video': return 'videocam';
      case 'text': return 'document-text';
      case 'interactive': return 'code-working';
      case 'project': return 'build';
      default: return 'document';
    }
  };
  
  // Handle module press
  const handleModulePress = (module) => {
    // Navigate to the module detail screen
    navigation.navigate('ModuleDetail', {
      moduleId: module.id,
      moduleTitle: module.title,
      moduleDescription: module.description,
      moduleImage: module.image,
    });
  };
  
  // Render a section with lessons
  const renderSection = (section, sectionIndex) => {
    return (
      <View key={sectionIndex} style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        
        <View style={styles.modulesContainer}>
          {section.modules.map((module, index) => (
            <TouchableOpacity
              key={module.id} 
              style={styles.moduleCard}
              onPress={() => handleModulePress(module)}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleNumber}>Module {index + 1}</Text>
                {module.completed && (
                  <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                )}
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <View style={styles.moduleFooter}>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => handleModulePress(module)}
                >
                  <Text style={styles.startButtonText}>
                    {module.completed ? 'REVIEW' : 'START'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const { width: windowWidth } = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  
  // Handle tab change
  const changeTab = (index) => {
    setActiveTab(index);
    
    // Scroll to corresponding section
    if (scrollViewRef.current) {
      // Calculate position to scroll to
      const sectionPosition = index * 300; // Approximate height of a section
      scrollViewRef.current.scrollTo({ y: sectionPosition, animated: true });
    }
  };
  
  // Handle scroll end to update active tab
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / windowWidth);
    if (index === 0) setActiveTab('modules');
    else setActiveTab('activity');
  };
  
  // Generate dot indicators
  const renderDotIndicators = () => {
    return (
      <View style={styles.dotsContainer}>
        {pathData.sections.map((_, index) => {
          const inputRange = [
            (index - 1) * windowWidth,
            index * windowWidth,
            (index + 1) * windowWidth,
          ];
          
          const scaleX = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ scaleX }],
                  opacity,
                  backgroundColor: activeTab === index ? accentColor : '#666',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  // Demo modules data
  const modules = [
    { id: 'm1', title: 'Getting Started with Python', completed: true },
    { id: 'm2', title: 'Data Types and Variables', completed: true },
    { id: 'm3', title: 'Control Flow', completed: false },
    { id: 'm4', title: 'Functions and Modules', completed: false },
    { id: 'm5', title: 'Data Structures', completed: false },
    { id: 'm6', title: 'File I/O', completed: false },
    { id: 'm7', title: 'Exception Handling', completed: false },
    { id: 'm8', title: 'Object-Oriented Programming', completed: false },
  ];
  
  // Demo activities for the contribution graph
  const activityData = [
    [0, 1, 3, 0, 0, 0, 1],
    [2, 0, 0, 4, 1, 0, 0],
    [0, 3, 1, 0, 2, 0, 1],
    [0, 0, 0, 1, 3, 2, 0],
  ];
  
  // Helper function to darken a color
  const adjustColor = (color, amount) => {
    // Convert hex to RGB
    let hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust the RGB values
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };
  
  // Render all modules for the modules tab
  const renderModules = () => {
    return (
      <View>
        {pathData.sections.map((section, sectionIndex) => (
          <View key={section.id} style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>{section.title}</Text>
            
            {section.modules.map((module, moduleIndex) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module)}
              >
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleNumber}>Module {moduleIndex + 1}</Text>
                  {module.completed && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                  )}
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                <View style={styles.moduleFooter}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${module.progress}%`, backgroundColor: accentColor }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{module.progress}%</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.startButton, {backgroundColor: accentColor}]}
                    onPress={() => handleModulePress(module)}
                  >
                    <Text style={styles.startButtonText}>
                      {module.completed ? 'REVIEW' : 'START'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };
  
  // Render the contribution grid
  const renderContributionGrid = () => {
    return (
      <View style={styles.contributionGrid}>
        <Text style={styles.activityTitle}>Your Activity</Text>
        <Text style={styles.activitySubtitle}>Last 4 weeks</Text>
        
        <View style={styles.gridContainer}>
          {activityData.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.gridWeek}>
              {week.map((count, dayIndex) => (
                <View 
                  key={`day-${weekIndex}-${dayIndex}`}
                  style={[
                    styles.gridDay,
                    {
                      backgroundColor: count === 0 
                        ? '#333' 
                        : count === 1 
                          ? accentColor 
                          : count === 2 
                            ? adjustColor(accentColor, -20) 
                            : count === 3 
                              ? adjustColor(accentColor, -40) 
                              : adjustColor(accentColor, -60),
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        
        <View style={styles.gridLegend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={[styles.legendDay, { backgroundColor: '#333' }]} />
          <View style={[styles.legendDay, { backgroundColor: accentColor }]} />
          <View style={[styles.legendDay, { backgroundColor: adjustColor(accentColor, -20) }]} />
          <View style={[styles.legendDay, { backgroundColor: adjustColor(accentColor, -40) }]} />
          <View style={[styles.legendDay, { backgroundColor: adjustColor(accentColor, -60) }]} />
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };
  
  // Render custom Python logo
  const renderPythonLogo = () => (
    <View style={styles.pythonLogo}>
      <View style={styles.pythonLogoBlue} />
      <View style={styles.pythonLogoYellow} />
    </View>
  );
  
  // Find the next module to continue
  const findNextModule = () => {
    for (const section of pathData.sections) {
      for (const module of section.modules) {
        if (!module.completed || module.progress < 100) {
          return { module, sectionTitle: section.title };
        }
      }
    }
    
    // If all modules are completed, return the first module
    if (pathData.sections.length > 0 && pathData.sections[0].modules.length > 0) {
      return { 
        module: pathData.sections[0].modules[0],
        sectionTitle: pathData.sections[0].title 
      };
    }
    
    return null;
  };
  
  // Handle continue button press
  const handleContinue = () => {
    const nextModule = findNextModule();
    if (nextModule) {
      handleModulePress(nextModule.module);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header section with logo and progress */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {renderPythonLogo()}
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.pathTitle}>{pathData.title}</Text>
            <Text style={styles.pathDescription}>{pathData.description}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { transform: [{ scaleX: progressPercentage / 100 }], backgroundColor: accentColor }
                  ]} 
                />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>{progressPercentage}% complete</Text>
                <Text style={styles.progressText}>{completedLessons}/{totalLessons} lessons</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Tab selector */}
        <View style={styles.tabSelector}>
          {pathData.sections.map((section, index) => (
            <TouchableOpacity 
              key={section.id}
              style={[
                styles.tab, 
                activeTab === index && [styles.activeTab, { borderBottomColor: accentColor }]
              ]}
              onPress={() => changeTab(index)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === index && [styles.activeTabText, { color: accentColor }]
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Dot indicators */}
        {renderDotIndicators()}
        
        {/* Main content with horizontal scrolling */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.scrollViewHorizontal}
        >
          {/* Modules tab */}
          <ScrollView 
            style={[styles.tabContent, { width }]}
            contentContainerStyle={styles.contentContainer}
          >
            {renderModules()}
          </ScrollView>
          
          {/* Activity tab */}
          <ScrollView 
            style={[styles.tabContent, { width }]}
            contentContainerStyle={styles.contentContainer}
          >
            {renderContributionGrid()}
          </ScrollView>
        </Animated.ScrollView>
        
        {/* Course sections */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>Course Content</Text>
          
          {pathData.sections.map((section, index) => renderSection(section, index))}
        </View>
        
        {/* Resources section */}
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>Resources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="book" size={20} color={accentColor} />
            <Text style={styles.resourceText}>Documentation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="chatbubbles" size={20} color={accentColor} />
            <Text style={styles.resourceText}>Community Forum</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="download" size={20} color={accentColor} />
            <Text style={styles.resourceText}>Download Materials</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Sticky continue button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: accentColor }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 80, // Space for the sticky button
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  pythonLogo: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pythonLogoBlue: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#4584b6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    transform: [{ rotate: '45deg' }],
  },
  pythonLogoYellow: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ffde57',
    position: 'absolute',
    top: 25,
    left: -25,
  },
  headerContent: {
    flex: 1,
  },
  pathTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pathDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 'auto',
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
    width: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'left',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#999',
    fontSize: 12,
  },
  sectionsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionContainer: {
    marginBottom: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedIcon: {
    marginRight: 5,
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonTypeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  lessonTitle: {
    color: '#fff',
    fontSize: 14,
  },
  completedText: {
    color: '#999',
  },
  lessonRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  resourcesContainer: {
    padding: 20,
  },
  resourcesTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  resourceText: {
    color: '#fff',
    marginLeft: 10,
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DEFAULT_ACCENT_COLOR,
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  scrollViewHorizontal: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  modulesContainer: {
    marginBottom: 20,
  },
  moduleCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  moduleNumber: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 14,
    fontWeight: 'bold',
  },
  moduleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  moduleFooter: {
    alignItems: 'flex-end',
  },
  startButton: {
    backgroundColor: DEFAULT_ACCENT_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contributionGrid: {
    marginBottom: 20,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activitySubtitle: {
    color: '#999',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  gridWeek: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  gridDay: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 5,
  },
  gridLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendDay: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  legendText: {
    color: '#999',
    fontSize: 12,
    marginHorizontal: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    height: 8,
    width: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionBlockTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moduleDescription: {
    color: '#999',
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'left',
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LearnPathScreen; 