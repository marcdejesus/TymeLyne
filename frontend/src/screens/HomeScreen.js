import React, { useContext } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Card from '../components/Card';

// Mock data - replace with API call
const activeCourses = [
  { id: '1', title: 'Tymelyne Tutorial', icon: require('../../assets/logo.png'), progress: 90 },
  { id: '2', title: 'Introduction to Digital Marketing', icon: require('../../assets/course-icons/marketing.png'), progress: 32 },
];

// Import tutorial data
import { tymelyneTutorialData } from '../data/tutorialData';

// Mock friend courses - replace with API call
const friendCourses = [
  { id: '3', title: 'User Interface Fundamentals', icon: require('../../assets/course-icons/design.png') },
  { id: '4', title: 'Responsive Web Design', icon: require('../../assets/course-icons/computer.png') },
  { id: '5', title: 'Mobile App Development', icon: require('../../assets/course-icons/computer.png') },
  { id: '6', title: 'Data Visualization Basics', icon: require('../../assets/course-icons/finance.png') },
];

const HomeScreen = ({ navigation }) => {
  const { logout, userInfo } = useContext(AuthContext);

  const handleNavigation = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Screen
      title="Home"
      showHeader={true}
      headerRight={{
        icon: 'menu-outline',
        onPress: handleMenuPress,
      }}
      activeScreen="Home"
      onHomePress={() => {}}
      onAchievementsPress={() => handleNavigation('Leaderboards')}
      onProfilePress={() => handleNavigation('Profile')}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        

        <SectionTitle 
          title="Active Courses" 
          rightText="View All" 
          onRightPress={() => handleNavigation('Development')} 
        />
        <View style={styles.coursesContainer}>
          {activeCourses && activeCourses.length > 0 ? (
            activeCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => handleNavigation('CourseSections', { courseId: course.id })}
                onOptionsPress={() => Alert.alert('Options', 'Course options')}
              />
            ))
          ) : (
            <Typography variant="body" style={styles.emptyCourseText}>
              You don't have any active courses yet.
            </Typography>
          )}
        </View>

        <SectionTitle title="Add a Course" />
        <View style={styles.addCourseContainer}>
          <Card
            variant="elevated"
            style={styles.addCourseCard}
            onPress={() => handleNavigation('Development')}
          >
            <Ionicons name="people-outline" size={32} color={colors.primary} />
            <View style={styles.addCourseTextContainer}>
              <Typography variant="subheading" weight="semiBold">
                Community
              </Typography>
              <Typography variant="body2" color={colors.text.secondary}>
                Find popular courses
              </Typography>
            </View>
          </Card>

          <Card
            variant="elevated"
            style={styles.addCourseCard}
            onPress={() => handleNavigation('Create')}
          >
            <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
            <View style={styles.addCourseTextContainer}>
              <Typography variant="subheading" weight="semiBold">
                Create New
              </Typography>
              <Typography variant="body2" color={colors.text.secondary}>
                Start from scratch
              </Typography>
            </View>
          </Card>
        </View>

        <SectionTitle 
          title="Friends' Courses" 
          rightText="See More" 
          onRightPress={() => handleNavigation('Development')} 
        />
        {friendCourses && friendCourses.length > 0 ? (
          <FlatList
            data={friendCourses}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                variant="grid"
                onPress={() => handleNavigation('CourseSections', { courseId: item.id })}
              />
            )}
            contentContainerStyle={styles.gridContainer}
          />
        ) : (
          <Typography variant="body" style={styles.emptyCourseText}>
            No courses from friends to display.
          </Typography>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  welcomeSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  coursesContainer: {
    marginBottom: spacing.l,
  },
  addCourseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  addCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    width: '48%',
  },
  addCourseTextContainer: {
    marginLeft: spacing.s,
    flex: 1,
  },
  gridContainer: {
    paddingBottom: spacing.xl,
  },
  emptyCourseText: {
    textAlign: 'center',
    marginTop: spacing.m,
  },
});

export default HomeScreen; 