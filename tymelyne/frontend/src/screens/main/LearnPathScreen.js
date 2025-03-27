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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * LearnPathScreen - Shows details of a specific learning path
 */
const LearnPathScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pathId } = route.params;
  const accent = '#FF9500';
  
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
        lessons: [
          { id: 'l1', title: 'Introduction', type: 'video', duration: '5m', completed: true },
          { id: 'l2', title: 'Setup Environment', type: 'text', duration: '10m', completed: true },
          { id: 'l3', title: 'First Program', type: 'interactive', duration: '15m', completed: true },
        ]
      },
      {
        id: 's2',
        title: 'Core Concepts',
        completed: pathId === '1',
        lessons: [
          { id: 'l4', title: 'Variables & Types', type: 'video', duration: '8m', completed: pathId === '1' },
          { id: 'l5', title: 'Control Flow', type: 'interactive', duration: '12m', completed: pathId === '1' },
          { id: 'l6', title: 'Functions', type: 'text', duration: '10m', completed: pathId === '1' },
          { id: 'l7', title: 'Mini Project', type: 'project', duration: '30m', completed: false },
        ]
      },
      {
        id: 's3',
        title: 'Advanced Topics',
        completed: false,
        lessons: [
          { id: 'l8', title: 'Data Structures', type: 'video', duration: '15m', completed: false },
          { id: 'l9', title: 'Error Handling', type: 'interactive', duration: '10m', completed: false },
          { id: 'l10', title: 'Libraries & Packages', type: 'text', duration: '8m', completed: false },
          { id: 'l11', title: 'Final Project', type: 'project', duration: '45m', completed: false },
        ]
      },
    ]
  };
  
  // Calculate path progress
  const totalLessons = pathData.sections.reduce((count, section) => 
    count + section.lessons.length, 0);
  
  const completedLessons = pathData.sections.reduce((count, section) => 
    count + section.lessons.filter(lesson => lesson.completed).length, 0);
  
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
  
  // Render a section
  const renderSection = (section, index) => {
    const isExpanded = expandedSections[section.id];
    
    return (
      <View style={styles.sectionContainer} key={section.id}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
        >
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionNumberContainer, { backgroundColor: accent }]}>
              <Text style={styles.sectionNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          
          <View style={styles.sectionRight}>
            {section.completed && (
              <Ionicons name="checkmark-circle" size={20} color={accent} style={styles.completedIcon} />
            )}
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#999" 
            />
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.lessonsList}>
            {section.lessons.map(lesson => (
              <TouchableOpacity 
                key={lesson.id} 
                style={styles.lessonItem}
                onPress={() => console.log(`Open lesson: ${lesson.title}`)}
              >
                <View style={styles.lessonLeft}>
                  <View style={[
                    styles.lessonTypeIconContainer,
                    { backgroundColor: lesson.completed ? accent : '#444' }
                  ]}>
                    <Ionicons 
                      name={getLessonTypeIcon(lesson.type)} 
                      size={14} 
                      color="#fff" 
                    />
                  </View>
                  <Text style={[
                    styles.lessonTitle,
                    lesson.completed && styles.completedText
                  ]}>
                    {lesson.title}
                  </Text>
                </View>
                
                <View style={styles.lessonRight}>
                  <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  {lesson.completed ? (
                    <Ionicons name="checkmark-circle" size={18} color={accent} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#999" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  const { width } = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState('modules');
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  
  // Handle tab change
  const changeTab = (tab) => {
    setActiveTab(tab);
    if (scrollViewRef.current) {
      const index = tab === 'modules' ? 0 : 1;
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };
  
  // Handle scroll end to update active tab
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index === 0) setActiveTab('modules');
    else setActiveTab('activity');
  };
  
  // Generate dot indicators
  const renderDotIndicators = () => {
    return (
      <View style={styles.dotsContainer}>
        {['overview', 'modules', 'contribution'].map((tab, index) => {
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
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={tab}
              style={[
                styles.dot,
                {
                  transform: [{ scaleX }],
                  opacity,
                  backgroundColor: activeTab === tab ? '#E67E22' : '#666',
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
  
  // Render modules list
  const renderModules = () => (
    <View style={styles.modulesContainer}>
      {modules.map((module, index) => (
        <TouchableOpacity 
          key={module.id} 
          style={styles.moduleCard}
          onPress={() => console.log(`Navigate to module: ${module.title}`)}
        >
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleNumber}>Module {index + 1}</Text>
            {module.completed && (
              <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
            )}
          </View>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <View style={styles.moduleFooter}>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>
                {module.completed ? 'REVIEW' : 'START'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // Render the contribution grid
  const renderContributionGrid = () => (
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
                        ? '#FF9500' 
                        : count === 2 
                          ? '#FF7B00' 
                          : count === 3 
                            ? '#FF5500' 
                            : '#FF3700',
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
        <View style={[styles.legendDay, { backgroundColor: '#FF9500' }]} />
        <View style={[styles.legendDay, { backgroundColor: '#FF7B00' }]} />
        <View style={[styles.legendDay, { backgroundColor: '#FF5500' }]} />
        <View style={[styles.legendDay, { backgroundColor: '#FF3700' }]} />
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
  
  // Render custom Python logo
  const renderPythonLogo = () => (
    <View style={styles.pythonLogo}>
      <View style={styles.pythonLogoBlue} />
      <View style={styles.pythonLogoYellow} />
    </View>
  );
  
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
                    { transform: [{ scaleX: progressPercentage / 100 }], backgroundColor: accent }
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
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'modules' && styles.activeTab]}
            onPress={() => changeTab('modules')}
          >
            <Text style={[styles.tabText, activeTab === 'modules' && styles.activeTabText]}>Modules</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => changeTab('activity')}
          >
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
          </TouchableOpacity>
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
            <Ionicons name="book" size={20} color={accent} />
            <Text style={styles.resourceText}>Documentation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="chatbubbles" size={20} color={accent} />
            <Text style={styles.resourceText}>Community Forum</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="download" size={20} color={accent} />
            <Text style={styles.resourceText}>Download Materials</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Sticky continue button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: accent }]}
          onPress={() => console.log('Continue learning')}
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
    borderBottomColor: '#FF9500',
  },
  tabText: {
    color: '#999',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FF9500',
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
    color: '#FF9500',
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
    backgroundColor: '#FF9500',
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
});

export default LearnPathScreen; 