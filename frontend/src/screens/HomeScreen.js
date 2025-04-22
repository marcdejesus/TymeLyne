import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TymeLyne</Text>
      
      <View style={styles.profileCard}>
        <Text style={styles.greeting}>
          Hello, {user?.fName} {user?.lName}!
        </Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.user_total_exp || 0}</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.follower_count || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.friends_count || 0}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>
      
      <View style={styles.courseSection}>
        <Text style={styles.sectionTitle}>Current Courses</Text>
        {user?.current_courses && user.current_courses.length > 0 ? (
          user.current_courses.map((course, index) => (
            <View key={index} style={styles.courseItem}>
              <Text>{course}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No courses in progress</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C4C6D',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B9C85',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B9C85',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  courseSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C4C6D',
    marginBottom: 15,
  },
  courseItem: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  emptyMessage: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen; 