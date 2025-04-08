import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getGeneratedCourses } from '../../services/courseStorage';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * Profile Screen - Shows user profile, stats, achievements, and learning progress
 */
const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const isOwnProfile = !route.params; // If no params, it's the user's own profile
  
  // State for generated courses
  const [generatedCourses, setGeneratedCourses] = useState([]);
  
  // Fetch generated courses
  useEffect(() => {
    const loadGeneratedCourses = async () => {
      if (isOwnProfile) {
        const courses = await getGeneratedCourses();
        setGeneratedCourses(courses);
      }
    };
    
    loadGeneratedCourses();
  }, [isOwnProfile]);
  
  // Demo user data
  const userData = {
    name: user?.name || 'Full Name',
    username: user?.username || 'username',
    tag: 'Learning Enthusiast',
    stats: {
      coursesCompleted: 2,
      coursesInProgress: 3,
      daysStreak: 5,
    },
    xp: {
      current: 750,
      nextLevel: 1000,
      level: 5,
    },
    achievements: [
      { id: '1', title: 'First Course', description: 'Completed your first course', icon: 'school', color: '#4CAF50', earned: true },
      { id: '2', title: 'Early Adopter', description: 'Joined during the beta phase', icon: 'star', color: '#FFC107', earned: true },
      { id: '3', title: 'Streak Master', description: 'Maintained a 5-day learning streak', icon: 'flame', color: '#FF5722', earned: true },
      { id: '4', title: 'Course Creator', description: 'Created your first AI course', icon: 'bulb', color: '#2196F3', earned: generatedCourses.length > 0 },
      { id: '5', title: 'Python Expert', description: 'Completed the Python course', icon: 'code-slash', color: '#9C27B0', earned: false },
    ],
    recentActivity: [
      { id: '1', type: 'course_progress', course: 'Python Fundamentals', progress: 65, icon: 'logo-python', color: '#3498db', date: '2 days ago' },
      { id: '2', type: 'achievement', achievement: 'Streak Master', icon: 'flame', color: '#FF5722', date: '3 days ago' },
      { id: '3', type: 'course_created', course: 'JavaScript Basics', icon: 'create', color: '#F7DF1E', date: '5 days ago' },
    ],
    certificates: [
      { id: '1', title: 'Python Programming', issueDate: 'May 15, 2023', icon: 'logo-python' },
      { id: '2', title: 'Web Development', issueDate: 'April 10, 2023', icon: 'code-slash' },
    ],
  };
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            const success = await logout();
            if (!success) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };
  
  // Handle create course
  const handleCreateCourse = () => {
    navigation.navigate('CourseCreator');
  };
  
  // Navigate to course overview
  const navigateToCourse = (courseId, title) => {
    navigation.navigate('CourseOverview', { courseId, title });
  };
  
  // Render an achievement badge
  const renderAchievement = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.achievementItem, 
        { opacity: item.earned ? 1 : 0.4 }
      ]}
    >
      <View style={[styles.achievementIconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementDesc}>{item.description}</Text>
    </TouchableOpacity>
  );
  
  // Render a certificate card
  const renderCertificate = ({ item }) => (
    <TouchableOpacity style={styles.certificateCard}>
      <View style={styles.certificateIcon}>
        <Ionicons name={item.icon} size={30} color={accentColor} />
      </View>
      <View style={styles.certificateDetails}>
        <Text style={styles.certificateTitle}>{item.title}</Text>
        <Text style={styles.certificateDate}>Issued: {item.issueDate}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
  
  // Render an activity item
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={20} color="#FFF" />
      </View>
      <View style={styles.activityDetails}>
        {item.type === 'course_progress' && (
          <>
            <Text style={styles.activityTitle}>Continue learning {item.course}</Text>
            <View style={styles.activityProgressBar}>
              <View style={[styles.activityProgressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
            </View>
          </>
        )}
        {item.type === 'achievement' && (
          <Text style={styles.activityTitle}>Earned the {item.achievement} badge</Text>
        )}
        {item.type === 'course_created' && (
          <Text style={styles.activityTitle}>Created {item.course} course</Text>
        )}
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
    </View>
  );
  
  // Render a generated course card
  const renderGeneratedCourse = ({ item }) => (
    <TouchableOpacity 
      style={styles.generatedCourseCard}
      onPress={() => navigateToCourse(item.id, item.title)}
    >
      <View style={styles.generatedCourseHeader}>
        <Ionicons name="sparkles" size={18} color={accentColor} />
        <Text style={styles.generatedCourseLabel}>AI-Generated</Text>
      </View>
      <Text style={styles.generatedCourseTitle}>{item.title}</Text>
      <Text style={styles.generatedCourseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.generatedCourseFooter}>
        <Text style={styles.generatedCourseModules}>
          {item.modules?.length || 0} modules
        </Text>
        {item.progress > 0 && (
          <View style={styles.generatedCourseProgress}>
            <View style={styles.generatedCourseProgressBar}>
              <View 
                style={[
                  styles.generatedCourseProgressFill, 
                  { width: `${item.progress}%`, backgroundColor: accentColor }
                ]} 
              />
            </View>
            <Text style={styles.generatedCourseProgressText}>{item.progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
            <View style={[styles.levelBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.levelText}>{userData.xp.level}</Text>
            </View>
          </View>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userHandle}>@{userData.username}</Text>
            <View style={styles.tagContainer}>
              <Text style={[styles.userTag, { color: accentColor }]}>{userData.tag}</Text>
            </View>
          </View>
          
          {/* Edit Profile or Add Friend Button */}
          {isOwnProfile ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={24} color={accentColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add" size={24} color={accentColor} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* XP Progress Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBarBackground}>
            <View 
              style={[
                styles.xpBarFill, 
                { width: `${(userData.xp.current / userData.xp.nextLevel) * 100}%`, backgroundColor: accentColor }
              ]} 
            />
          </View>
          <View style={styles.xpTextContainer}>
            <Text style={styles.xpText}>
              {userData.xp.current}/{userData.xp.nextLevel} XP
            </Text>
            <Text style={styles.xpToLevelUp}>
              {userData.xp.nextLevel - userData.xp.current} XP to Level {userData.xp.level + 1}
            </Text>
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color={accentColor} />
            <Text style={styles.statValue}>{userData.stats.coursesCompleted}</Text>
            <Text style={styles.statLabel}>Courses Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="hourglass" size={24} color={accentColor} />
            <Text style={styles.statValue}>{userData.stats.coursesInProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color={accentColor} />
            <Text style={styles.statValue}>{userData.stats.daysStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
        
        {/* Recent Activity Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={userData.recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
        
        {/* Generated Courses Section - only shown if there are any */}
        {generatedCourses.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Generated Courses</Text>
              <TouchableOpacity onPress={handleCreateCourse}>
                <Text style={[styles.sectionAction, { color: accentColor }]}>Create New</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={generatedCourses}
              renderItem={renderGeneratedCourse}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.generatedCoursesContainer}
            />
          </View>
        )}
        
        {/* Achievements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionAction, { color: accentColor }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={userData.achievements}
            renderItem={renderAchievement}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          />
        </View>
        
        {/* Certificates Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Certificates</Text>
          <FlatList
            data={userData.certificates}
            renderItem={renderCertificate}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.certificatesContainer}
          />
        </View>
        
        {/* Create Course Button */}
        {isOwnProfile && (
          <TouchableOpacity 
            style={[styles.createCourseButton, { backgroundColor: accentColor }]}
            onPress={handleCreateCourse}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.createCourseText}>Create Custom Course</Text>
          </TouchableOpacity>
        )}
        
        {/* Logout Button (only on own profile) */}
        {isOwnProfile && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#444',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  levelText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userHandle: {
    color: '#999',
    fontSize: 16,
  },
  tagContainer: {
    marginTop: 5,
  },
  userTag: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  xpText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpToLevelUp: {
    color: '#999',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionAction: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
  },
  activityProgressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 5,
    marginTop: 5,
    width: '100%',
  },
  activityProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  activityDate: {
    color: '#999',
    fontSize: 12,
  },
  achievementsContainer: {
    paddingBottom: 10,
  },
  achievementItem: {
    width: 150,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  achievementDesc: {
    color: '#999',
    fontSize: 12,
  },
  certificatesContainer: {
    gap: 15,
  },
  certificateCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  certificateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  certificateDetails: {
    flex: 1,
  },
  certificateTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  certificateDate: {
    color: '#999',
    fontSize: 12,
  },
  generatedCoursesContainer: {
    paddingBottom: 10,
  },
  generatedCourseCard: {
    width: 250,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
  },
  generatedCourseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  generatedCourseLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  generatedCourseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  generatedCourseDescription: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 12,
    height: 40,
  },
  generatedCourseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generatedCourseModules: {
    color: '#999',
    fontSize: 12,
  },
  generatedCourseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generatedCourseProgressBar: {
    width: 50,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginRight: 5,
    overflow: 'hidden',
  },
  generatedCourseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  generatedCourseProgressText: {
    color: '#999',
    fontSize: 12,
  },
  createCourseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 12,
  },
  createCourseText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 