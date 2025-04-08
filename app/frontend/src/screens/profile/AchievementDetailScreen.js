import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * AchievementDetailScreen - Displays detailed information about an achievement
 * 
 * @param {Object} route - Route object containing the achievement data
 * @param {Object} navigation - Navigation object for screen navigation
 */
const AchievementDetailScreen = ({ route, navigation }) => {
  const { achievement } = route.params;
  const { accent, current } = useTheme();
  
  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not earned yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate progress percentage
  const progressPercentage = achievement.progress || 0;
  const completed = achievement.earned_at !== null;
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: current.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: current.text }]}>Achievement</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Achievement Card */}
        <View style={[styles.achievementCard, { backgroundColor: current.card }]}>
          {/* Icon */}
          <View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: completed ? accent : current.cardSecondary,
                opacity: completed ? 1 : 0.7
              }
            ]}
          >
            <Ionicons 
              name={achievement.icon || 'trophy'} 
              size={50} 
              color={completed ? '#fff' : current.textSecondary} 
            />
          </View>
          
          {/* Title and Status */}
          <Text style={[styles.achievementTitle, { color: current.text }]}>
            {achievement.name}
          </Text>
          
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: completed ? accent + '20' : current.cardSecondary }
              ]}
            >
              <Text style={[styles.statusText, { color: completed ? accent : current.textSecondary }]}>
                {completed ? 'COMPLETED' : 'IN PROGRESS'}
              </Text>
            </View>
          </View>
          
          {/* Date Earned */}
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: current.textSecondary }]}>
              {completed ? 'Earned on' : 'Status'}
            </Text>
            <Text style={[styles.detailValue, { color: current.text }]}>
              {completed 
                ? formatDate(achievement.earned_at) 
                : `${progressPercentage}% complete`
              }
            </Text>
          </View>
          
          {/* XP Reward */}
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: current.textSecondary }]}>
              XP Reward
            </Text>
            <Text style={[styles.detailValue, { color: current.text }]}>
              {achievement.xp_reward} XP
            </Text>
          </View>
          
          {/* Progress Bar (if not completed) */}
          {!completed && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: current.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: accent,
                      width: `${progressPercentage}%` 
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Description Section */}
        <View style={[styles.section, { backgroundColor: current.card }]}>
          <Text style={[styles.sectionTitle, { color: current.text }]}>Description</Text>
          <Text style={[styles.description, { color: current.textSecondary }]}>
            {achievement.description || 'No description available.'}
          </Text>
        </View>
        
        {/* Criteria Section */}
        <View style={[styles.section, { backgroundColor: current.card }]}>
          <Text style={[styles.sectionTitle, { color: current.text }]}>How to Earn</Text>
          <Text style={[styles.description, { color: current.textSecondary }]}>
            {achievement.criteria || achievement.description || 'Complete the required tasks to earn this achievement.'}
          </Text>
        </View>
        
        {/* Category Badge */}
        <View style={[styles.section, { backgroundColor: current.card }]}>
          <Text style={[styles.sectionTitle, { color: current.text }]}>Category</Text>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: accent + '30' }]}>
              <Text style={[styles.categoryText, { color: accent }]}>
                {achievement.category || 'General'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Share Button */}
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: completed ? accent : current.border }]}
          disabled={!completed}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareText}>
            {completed ? 'Share Achievement' : 'Earn to Share'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    padding: 16,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AchievementDetailScreen; 