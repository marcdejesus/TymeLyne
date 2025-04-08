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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * Shop Screen - Displays available courses, learning tools, and premium features
 */
const ShopScreen = () => {
  const navigation = useNavigation();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Mock user data instead of using Auth context
  const user = {
    name: 'John Doe',
    username: 'johndoe',
    coins: 350,
    xp: 500,
    level: 5
  };
  
  const [activeTab, setActiveTab] = useState('courses');
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef(null);
  
  // Handle tab change
  const changeTab = (tab) => {
    setActiveTab(tab);
    if (scrollViewRef.current) {
      const index = tab === 'courses' ? 0 : tab === 'tools' ? 1 : 2;
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };
  
  // Handle scroll end to update active tab
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index === 0) setActiveTab('courses');
    else if (index === 1) setActiveTab('tools');
    else setActiveTab('premium');
  };

  // Premium course items
  const courseItems = [
    { 
      id: 'c1', 
      name: 'Advanced Python Masterclass', 
      price: 500, 
      image: require('../../../assets/python-logo.png'),
      description: 'Take your Python skills to the next level with advanced topics',
      modules: 8,
      duration: '20 hours'
    },
    { 
      id: 'c2', 
      name: 'JavaScript Frameworks', 
      price: 450, 
      image: require('../../../assets/javascript-logo.png'),
      description: 'Learn popular JavaScript frameworks like React, Vue, and Angular',
      modules: 6,
      duration: '15 hours'
    },
    { 
      id: 'c3', 
      name: 'Data Science Fundamentals', 
      price: 600, 
      image: require('../../../assets/python-logo.png'),
      description: 'An introduction to data analysis, visualization, and machine learning',
      modules: 10,
      duration: '25 hours'
    },
  ];
  
  // Learning tools items
  const toolItems = [
    { 
      id: 't1', 
      name: 'XP Booster (30 days)', 
      price: 200, 
      icon: 'flash',
      description: 'Earn 2x XP on all learning activities for 30 days',
      popular: true
    },
    { 
      id: 't2', 
      name: 'Task Automator', 
      price: 150, 
      icon: 'timer',
      description: 'Automatically schedule study reminders and track progress'
    },
    { 
      id: 't3', 
      name: 'AI Study Assistant', 
      price: 300, 
      icon: 'bulb-outline',
      description: 'Get personalized learning tips and content recommendations'
    },
    { 
      id: 't4', 
      name: 'Focus Mode', 
      price: 100, 
      icon: 'eye',
      description: 'Block distractions and optimize your learning environment'
    },
  ];
  
  // Render a course card
  const renderCourseItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.courseCard}
      onPress={() => console.log(`View course: ${item.name}`)}
    >
      <Image source={item.image} style={styles.courseImage} resizeMode="contain" />
      <View style={styles.courseContent}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseDescription}>{item.description}</Text>
        
        <View style={styles.courseDetails}>
          <View style={styles.courseDetail}>
            <Ionicons name="book-outline" size={14} color="#999" />
            <Text style={styles.courseDetailText}>{item.modules} modules</Text>
          </View>
          <View style={styles.courseDetail}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.courseDetailText}>{item.duration}</Text>
          </View>
        </View>
        
        <View style={styles.courseFooter}>
          <View style={styles.priceContainer}>
            <Ionicons name="logo-bitcoin" size={16} color={accentColor} />
            <Text style={styles.coursePrice}>{item.price}</Text>
          </View>
          
          <TouchableOpacity style={[styles.buyButton, { backgroundColor: accentColor }]}>
            <Text style={styles.buyButtonText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render a tool/booster item
  const renderToolItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.toolCard}
      onPress={() => console.log(`Buy tool: ${item.name}`)}
    >
      {item.popular && (
        <View style={[styles.popularTag, { backgroundColor: accentColor }]}>
          <Text style={styles.popularTagText}>Popular</Text>
        </View>
      )}
      
      <View style={styles.toolIconContainer}>
        <Ionicons name={item.icon} size={32} color={accentColor} />
      </View>
      
      <Text style={styles.toolName}>{item.name}</Text>
      <Text style={styles.toolDescription}>{item.description}</Text>
      
      <View style={styles.toolFooter}>
        <View style={styles.priceContainer}>
          <Ionicons name="logo-bitcoin" size={16} color={accentColor} />
          <Text style={styles.toolPrice}>{item.price}</Text>
        </View>
        
        <TouchableOpacity style={[styles.buyButton, { backgroundColor: accentColor }]}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  // Render premium features
  const renderPremiumSection = () => (
    <View style={styles.premiumContainer}>
      <View style={styles.premiumHeader}>
        <Ionicons name="diamond" size={36} color={accentColor} />
        <Text style={styles.premiumTitle}>Premium Membership</Text>
      </View>
      
      <Text style={styles.premiumDescription}>
        Unlock all courses and features with our premium membership. Learn faster, smarter, and without limits.
      </Text>
      
      <View style={styles.premiumFeaturesContainer}>
        <View style={styles.premiumFeature}>
          <Ionicons name="checkmark-circle" size={24} color={accentColor} />
          <Text style={styles.premiumFeatureText}>Access to all premium courses</Text>
        </View>
        
        <View style={styles.premiumFeature}>
          <Ionicons name="checkmark-circle" size={24} color={accentColor} />
          <Text style={styles.premiumFeatureText}>Unlimited AI-generated custom courses</Text>
        </View>
        
        <View style={styles.premiumFeature}>
          <Ionicons name="checkmark-circle" size={24} color={accentColor} />
          <Text style={styles.premiumFeatureText}>Advanced progress tracking</Text>
        </View>
        
        <View style={styles.premiumFeature}>
          <Ionicons name="checkmark-circle" size={24} color={accentColor} />
          <Text style={styles.premiumFeatureText}>Exclusive badges and profile customization</Text>
        </View>
        
        <View style={styles.premiumFeature}>
          <Ionicons name="checkmark-circle" size={24} color={accentColor} />
          <Text style={styles.premiumFeatureText}>Priority support</Text>
        </View>
      </View>
      
      <View style={styles.premiumPricing}>
        <View style={styles.premiumPlan}>
          <Text style={styles.premiumPlanDuration}>Monthly</Text>
          <Text style={styles.premiumPlanPrice}>$9.99</Text>
          <TouchableOpacity style={[styles.premiumPlanButton, { backgroundColor: accentColor }]}>
            <Text style={styles.premiumPlanButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.premiumPlan, styles.popularPlan]}>
          <View style={styles.popularPlanTag}>
            <Text style={styles.popularPlanTagText}>BEST VALUE</Text>
          </View>
          <Text style={styles.premiumPlanDuration}>Annual</Text>
          <Text style={styles.premiumPlanPrice}>$89.99</Text>
          <Text style={styles.premiumPlanSaving}>Save 25%</Text>
          <TouchableOpacity style={[styles.premiumPlanButton, { backgroundColor: accentColor }]}>
            <Text style={styles.premiumPlanButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Shop</Text>
        <View style={styles.coinsContainer}>
          <Ionicons name="logo-bitcoin" size={24} color={accentColor} />
          <Text style={styles.coinsText}>{user.coins}</Text>
        </View>
      </View>
      
      {/* Tab selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'courses' && [styles.activeTab, { borderColor: accentColor }]]}
          onPress={() => changeTab('courses')}
        >
          <Ionicons 
            name="book" 
            size={20} 
            color={activeTab === 'courses' ? accentColor : '#999'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'courses' && [styles.activeTabText, { color: accentColor }]
            ]}
          >
            Courses
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tools' && [styles.activeTab, { borderColor: accentColor }]]}
          onPress={() => changeTab('tools')}
        >
          <Ionicons 
            name="construct" 
            size={20} 
            color={activeTab === 'tools' ? accentColor : '#999'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'tools' && [styles.activeTabText, { color: accentColor }]
            ]}
          >
            Learning Tools
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'premium' && [styles.activeTab, { borderColor: accentColor }]]}
          onPress={() => changeTab('premium')}
        >
          <Ionicons 
            name="diamond" 
            size={20} 
            color={activeTab === 'premium' ? accentColor : '#999'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'premium' && [styles.activeTabText, { color: accentColor }]
            ]}
          >
            Premium
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Shop content */}
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
        {/* Premium Courses */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.sectionTitle}>Premium Courses</Text>
          <Text style={styles.sectionSubtitle}>
            Enhance your skills with our premium course collection
          </Text>
          
          {courseItems.map(renderCourseItem)}
          
          <TouchableOpacity 
            style={styles.createCourseButton}
            onPress={() => navigation.navigate('CourseCreator')}
          >
            <View style={[styles.createCourseIcon, { backgroundColor: accentColor }]}>
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
            <View style={styles.createCourseContent}>
              <Text style={styles.createCourseTitle}>Create a Custom Course</Text>
              <Text style={styles.createCourseDescription}>
                Use our AI to generate a personalized learning experience
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </ScrollView>
        
        {/* Learning Tools */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.sectionTitle}>Learning Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Boost your learning efficiency with these powerful tools
          </Text>
          
          <View style={styles.toolsGrid}>
            {toolItems.map(renderToolItem)}
          </View>
        </ScrollView>
        
        {/* Premium Membership */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.contentContainer}
        >
          {renderPremiumSection()}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinsText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    color: '#999',
    marginLeft: 5,
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
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
  },
  courseCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#333',
  },
  courseContent: {
    padding: 15,
  },
  courseName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  courseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  courseDetailText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coursePrice: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 16,
  },
  buyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    position: 'relative',
  },
  popularTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  popularTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  toolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toolDescription: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 12,
    height: 70,
  },
  toolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolPrice: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  premiumContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  premiumDescription: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  premiumFeaturesContainer: {
    marginBottom: 30,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumFeatureText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 15,
  },
  premiumPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumPlan: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: DEFAULT_ACCENT_COLOR,
  },
  popularPlanTag: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    borderRadius: 5,
  },
  popularPlanTagText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  premiumPlanDuration: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  premiumPlanPrice: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  premiumPlanSaving: {
    color: '#4CAF50',
    marginBottom: 15,
  },
  premiumPlanButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  premiumPlanButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  createCourseButton: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createCourseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  createCourseContent: {
    flex: 1,
  },
  createCourseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  createCourseDescription: {
    color: '#CCC',
    fontSize: 12,
  },
});

export default ShopScreen; 