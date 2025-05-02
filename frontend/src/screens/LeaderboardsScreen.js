import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

// Leaderboard list item component
const LeaderboardItem = ({ item, rank }) => {
  const isCurrentUser = item.isCurrentUser;
  
  return (
    <View style={[
      styles.leaderboardItem,
      isCurrentUser && styles.currentUserItem
    ]}>
      <Text style={[styles.rankText, isCurrentUser && styles.currentUserText]}>
        {rank}
      </Text>
      
      <Image 
        source={item.avatar || require('../../assets/default-avatar.png')} 
        style={styles.avatar}
        resizeMode="cover"
      />
      
      <View style={styles.userInfo}>
        <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
          {item.username}
        </Text>
        {item.lastActive && (
          <Text style={styles.lastActive}>Active {item.lastActive}</Text>
        )}
      </View>
      
      <View style={styles.xpContainer}>
        <Text style={[styles.xpText, isCurrentUser && styles.currentUserText]}>
          {item.xp} XP
        </Text>
        
        {item.trend > 0 && (
          <View style={styles.trendContainer}>
            <Ionicons name="trending-up" size={16} color={colors.success} />
            <Text style={styles.trendText}>{item.trend}%</Text>
          </View>
        )}
        
        {item.trend < 0 && (
          <View style={styles.trendContainer}>
            <Ionicons name="trending-down" size={16} color={colors.error} />
            <Text style={styles.trendText}>{Math.abs(item.trend)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const LeaderboardsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('global');
  
  // Mock data - would be fetched from backend in real app
  const mockGlobalUsers = Array(100).fill().map((_, i) => ({
    id: `global-${i}`,
    username: `@user${i + 1}`,
    xp: Math.floor(Math.random() * 10000) + 1000,
    trend: Math.floor(Math.random() * 40) - 20,
    avatar: null,
    isCurrentUser: i === 14
  })).sort((a, b) => b.xp - a.xp);
  
  const mockFriends = Array(25).fill().map((_, i) => ({
    id: `friend-${i}`,
    username: `@friend${i + 1}`,
    xp: Math.floor(Math.random() * 8000) + 500,
    trend: Math.floor(Math.random() * 40) - 10,
    lastActive: i < 5 ? 'today' : i < 10 ? 'yesterday' : `${i - 9} days ago`,
    avatar: null,
    isCurrentUser: i === 3
  })).sort((a, b) => b.xp - a.xp);
  
  const handleBackPress = () => {
    // No need to navigate to Home when back is pressed, as we're in a tab navigator
    // This can be removed or keep for custom behavior
  };
  
  const handleNavigation = (screenName, params) => {
    // Update to work with new navigation structure
    navigation.navigate(screenName, params);
  };
  
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };
  
  const renderHeader = () => {
    const periodText = activeTab === 'global' ? 'Weekly XP' : 'Monthly XP';
    
    return (
      <View style={styles.leaderboardHeader}>
        <Text style={styles.rankHeaderText}>Rank</Text>
        <Text style={styles.usernameHeaderText}>User</Text>
        <Text style={styles.xpHeaderText}>{periodText}</Text>
      </View>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Data Available</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'global' 
          ? 'Global leaderboard data is being refreshed.' 
          : 'Add friends to see their progress on the leaderboard!'}
      </Text>
    </View>
  );
  
  return (
    <Screen
      title="Leaderboards"
      backgroundColor={colors.background}
      // Remove bottom navigation props since they're now handled by Tab.Navigator
      showBottomNav={false}
    >
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'global' && styles.activeTabButton]}
          onPress={() => toggleTab('global')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
            Global
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTabButton]}
          onPress={() => toggleTab('friends')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Timer/Period info */}
      <View style={styles.periodContainer}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.periodText}>
          {activeTab === 'global' ? 'Weekly leaderboard • Resets in 3 days' : 'Monthly leaderboard • May 2023'}
        </Text>
      </View>
      
      {/* Leaderboard List */}
      <FlatList
        data={activeTab === 'global' ? mockGlobalUsers : mockFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardItem item={item} rank={index + 1} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        style={styles.leaderboardList}
        contentContainerStyle={styles.leaderboardContent}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Add Friend Button (Only in friends tab) */}
      {activeTab === 'friends' && (
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => handleNavigation('FindFriends')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.textInverted} />
        </TouchableOpacity>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.textInverted,
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  periodText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  leaderboardList: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  leaderboardContent: {
    paddingVertical: 8,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankHeaderText: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  usernameHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  xpHeaderText: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'right',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  currentUserItem: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  rankText: {
    width: 40,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    overflow: 'hidden',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
    marginLeft: 2,
    color: colors.textSecondary,
  },
  currentUserText: {
    color: colors.primary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  addFriendButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default LeaderboardsScreen; 