import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * LeaderboardsScreen - Shows user rankings based on XP and achievements
 */
const LeaderboardsScreen = () => {
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // State for active leaderboard type
  const [activeLeaderboard, setActiveLeaderboard] = useState('daily');
  
  // Mock leaderboard data
  const leaderboardData = {
    daily: [
      { id: '1', name: 'Alex Johnson', username: 'alexj', xp: 350, rank: 1, isCurrentUser: false },
      { id: '2', name: 'Sarah Williams', username: 'sarahw', xp: 320, rank: 2, isCurrentUser: false },
      { id: '3', name: 'John Doe', username: 'johndoe', xp: 280, rank: 3, isCurrentUser: true },
      { id: '4', name: 'Mike Smith', username: 'mikes', xp: 250, rank: 4, isCurrentUser: false },
      { id: '5', name: 'Emily Davis', username: 'emilyd', xp: 220, rank: 5, isCurrentUser: false },
      { id: '6', name: 'Jessica Brown', username: 'jessb', xp: 200, rank: 6, isCurrentUser: false },
      { id: '7', name: 'David Miller', username: 'davidm', xp: 180, rank: 7, isCurrentUser: false },
      { id: '8', name: 'Lisa Taylor', username: 'lisat', xp: 150, rank: 8, isCurrentUser: false },
      { id: '9', name: 'Robert Wilson', username: 'robertw', xp: 120, rank: 9, isCurrentUser: false },
      { id: '10', name: 'Amanda Moore', username: 'amandam', xp: 100, rank: 10, isCurrentUser: false },
    ],
    weekly: [
      { id: '1', name: 'Sarah Williams', username: 'sarahw', xp: 1200, rank: 1, isCurrentUser: false },
      { id: '2', name: 'Alex Johnson', username: 'alexj', xp: 1150, rank: 2, isCurrentUser: false },
      { id: '3', name: 'Mike Smith', username: 'mikes', xp: 1050, rank: 3, isCurrentUser: false },
      { id: '4', name: 'John Doe', username: 'johndoe', xp: 950, rank: 4, isCurrentUser: true },
      { id: '5', name: 'Emily Davis', username: 'emilyd', xp: 900, rank: 5, isCurrentUser: false },
      { id: '6', name: 'Jessica Brown', username: 'jessb', xp: 850, rank: 6, isCurrentUser: false },
      { id: '7', name: 'David Miller', username: 'davidm', xp: 800, rank: 7, isCurrentUser: false },
      { id: '8', name: 'Lisa Taylor', username: 'lisat', xp: 750, rank: 8, isCurrentUser: false },
      { id: '9', name: 'Robert Wilson', username: 'robertw', xp: 700, rank: 9, isCurrentUser: false },
      { id: '10', name: 'Amanda Moore', username: 'amandam', xp: 650, rank: 10, isCurrentUser: false },
    ],
    allTime: [
      { id: '1', name: 'Alex Johnson', username: 'alexj', xp: 15000, rank: 1, isCurrentUser: false },
      { id: '2', name: 'Sarah Williams', username: 'sarahw', xp: 12500, rank: 2, isCurrentUser: false },
      { id: '3', name: 'Mike Smith', username: 'mikes', xp: 10200, rank: 3, isCurrentUser: false },
      { id: '4', name: 'Emily Davis', username: 'emilyd', xp: 9800, rank: 4, isCurrentUser: false },
      { id: '5', name: 'Jessica Brown', username: 'jessb', xp: 8500, rank: 5, isCurrentUser: false },
      { id: '6', name: 'David Miller', username: 'davidm', xp: 7800, rank: 6, isCurrentUser: false },
      { id: '7', name: 'John Doe', username: 'johndoe', xp: 7200, rank: 7, isCurrentUser: true },
      { id: '8', name: 'Lisa Taylor', username: 'lisat', xp: 6500, rank: 8, isCurrentUser: false },
      { id: '9', name: 'Robert Wilson', username: 'robertw', xp: 5800, rank: 9, isCurrentUser: false },
      { id: '10', name: 'Amanda Moore', username: 'amandam', xp: 5200, rank: 10, isCurrentUser: false },
    ],
  };
  
  // Render leaderboard tabs
  const renderLeaderboardTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeLeaderboard === 'daily' && [styles.activeTab, {borderBottomColor: accentColor}]]}
        onPress={() => setActiveLeaderboard('daily')}
      >
        <Text style={[styles.tabText, activeLeaderboard === 'daily' && {color: accentColor}]}>Daily</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeLeaderboard === 'weekly' && [styles.activeTab, {borderBottomColor: accentColor}]]}
        onPress={() => setActiveLeaderboard('weekly')}
      >
        <Text style={[styles.tabText, activeLeaderboard === 'weekly' && {color: accentColor}]}>Weekly</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeLeaderboard === 'allTime' && [styles.activeTab, {borderBottomColor: accentColor}]]}
        onPress={() => setActiveLeaderboard('allTime')}
      >
        <Text style={[styles.tabText, activeLeaderboard === 'allTime' && {color: accentColor}]}>All Time</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render a leaderboard item
  const renderLeaderboardItem = ({ item }) => (
    <View style={[styles.leaderboardItem, item.isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.usernameText}>@{item.username}</Text>
      </View>
      
      <View style={styles.xpContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.xpText}>{item.xp.toLocaleString()}</Text>
      </View>
    </View>
  );
  
  // Render header with trophy icons for top 3
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Leaderboards</Text>
      <Text style={styles.headerSubtitle}>
        {activeLeaderboard === 'daily' && 'Top performers today'}
        {activeLeaderboard === 'weekly' && 'Top performers this week'}
        {activeLeaderboard === 'allTime' && 'All-time champions'}
      </Text>
      
      <View style={styles.trophyContainer}>
        {leaderboardData[activeLeaderboard].slice(0, 3).map((user, index) => (
          <View key={user.id} style={[styles.trophyItem, styles[`trophy${index + 1}`]]}>
            <View style={styles.trophyAvatar}>
              <Text style={styles.trophyAvatarText}>{user.name.charAt(0)}</Text>
            </View>
            <Ionicons 
              name="trophy" 
              size={24} 
              color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
            />
            <Text style={styles.trophyName}>{user.name.split(' ')[0]}</Text>
            <Text style={styles.trophyXP}>{user.xp} XP</Text>
          </View>
        ))}
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderLeaderboardTabs()}
      
      <FlatList
        data={leaderboardData[activeLeaderboard]}
        renderItem={renderLeaderboardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#333',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 5,
  },
  trophyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 20,
    height: 150,
  },
  trophyItem: {
    alignItems: 'center',
    margin: 5,
  },
  trophy1: {
    height: 150,
    zIndex: 3,
  },
  trophy2: {
    height: 130,
    zIndex: 2,
  },
  trophy3: {
    height: 110,
    zIndex: 1,
  },
  trophyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  trophyAvatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  trophyName: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 5,
  },
  trophyXP: {
    color: '#FFD700',
    fontSize: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#333',
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DEFAULT_ACCENT_COLOR,
  },
  tabText: {
    color: '#AAA',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: DEFAULT_ACCENT_COLOR,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  currentUserItem: {
    backgroundColor: 'rgba(230, 126, 34, 0.2)',
    borderWidth: 1,
    borderColor: '#E67E22',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  usernameText: {
    color: '#AAA',
    fontSize: 12,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default LeaderboardsScreen; 