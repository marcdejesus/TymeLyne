import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * AchievementDetailScreen - Displays detailed information about an achievement
 * 
 * @param {Object} route - Navigation route containing the achievement data
 * @param {Object} navigation - Navigation object for navigating back
 */
const AchievementDetailScreen = ({ route, navigation }) => {
  const { achievement } = route.params;
  const { accent, current } = useTheme();
  
  // Format the date earned (if available)
  const formattedDate = achievement.earned_at 
    ? new Date(achievement.earned_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not earned yet';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: current.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: current.text }]}>Achievement Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Achievement Icon */}
        <View style={[
          styles.iconContainer,
          { 
            backgroundColor: `${accent}20`,
            borderColor: accent 
          }
        ]}>
          <Ionicons 
            name={achievement.icon || 'trophy'} 
            size={64} 
            color={accent} 
          />
        </View>
        
        {/* Achievement Title */}
        <Text style={[styles.title, { color: current.text }]}>
          {achievement.name}
        </Text>
        
        {/* Achievement Category */}
        <View style={[styles.categoryContainer, { backgroundColor: `${accent}20` }]}>
          <Text style={[styles.category, { color: accent }]}>
            {achievement.category || 'Achievement'}
          </Text>
        </View>
        
        {/* Achievement Description */}
        <View style={[styles.sectionContainer, { backgroundColor: current.card }]}>
          <Text style={[styles.sectionTitle, { color: current.text }]}>Description</Text>
          <Text style={[styles.description, { color: current.textSecondary }]}>
            {achievement.description || 'No description available'}
          </Text>
        </View>
        
        {/* Achievement Stats */}
        <View style={[styles.sectionContainer, { backgroundColor: current.card }]}>
          <Text style={[styles.sectionTitle, { color: current.text }]}>Details</Text>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: current.textSecondary }]}>Status</Text>
            <View style={styles.statValue}>
              {achievement.earned_at ? (
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: accent }]} />
                  <Text style={[styles.statusText, { color: accent }]}>Completed</Text>
                </View>
              ) : (
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: '#888' }]} />
                  <Text style={[styles.statusText, { color: '#888' }]}>Incomplete</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: current.textSecondary }]}>XP Reward</Text>
            <Text style={[styles.statValue, { color: current.text }]}>
              {achievement.xp_reward || 0} XP
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: current.textSecondary }]}>Date Earned</Text>
            <Text style={[styles.statValue, { color: current.text }]}>
              {formattedDate}
            </Text>
          </View>
          
          {achievement.progress !== undefined && (
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: current.textSecondary }]}>Progress</Text>
              <Text style={[styles.statValue, { color: current.text }]}>
                {`${achievement.progress}%`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 32,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AchievementDetailScreen; 