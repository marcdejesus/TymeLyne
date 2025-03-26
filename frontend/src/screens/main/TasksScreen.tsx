import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/layout/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface LeaderboardUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  weeklyXP: number;
  level: number;
  rank: number;
  isCurrentUser?: boolean;
}

// Sample leaderboard data for development
const sampleLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    username: 'alex_dev',
    fullName: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    weeklyXP: 1250,
    level: 18,
    rank: 1,
  },
  {
    id: '2',
    username: 'sarah_coder',
    fullName: 'Sarah Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    weeklyXP: 980,
    level: 16,
    rank: 2,
  },
  {
    id: '3',
    username: 'mark_tech',
    fullName: 'Mark Smith',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    weeklyXP: 920,
    level: 15,
    rank: 3,
  },
  {
    id: '4',
    username: 'jessica_p',
    fullName: 'Jessica Parker',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    weeklyXP: 780,
    level: 14,
    rank: 4,
  },
  {
    id: '5',
    username: 'thomas_j',
    fullName: 'Thomas Jones',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    weeklyXP: 650,
    level: 12,
    rank: 5,
  },
  {
    id: '6',
    username: 'emma_w',
    fullName: 'Emma Watson',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    weeklyXP: 580,
    level: 11,
    rank: 6,
  },
  {
    id: '7',
    username: 'david_n',
    fullName: 'David Nelson',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    weeklyXP: 520,
    level: 10,
    rank: 7,
  },
  {
    id: '8',
    username: 'olivia_s',
    fullName: 'Olivia Smith',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    weeklyXP: 480,
    level: 9,
    rank: 8,
  },
  {
    id: '9',
    username: 'daniel_k',
    fullName: 'Daniel Kim',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    weeklyXP: 410,
    level: 8,
    rank: 9,
  },
  {
    id: '10',
    username: 'sophia_r',
    fullName: 'Sophia Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
    weeklyXP: 350,
    level: 7,
    rank: 10,
  },
];

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  // Function to add the current user to the leaderboard
  const getLeaderboardWithCurrentUser = (): LeaderboardUser[] => {
    if (!profile) return sampleLeaderboard;
    
    // Create current user entry
    const currentUserEntry: LeaderboardUser = {
      id: profile.id || '0',
      username: profile.email?.split('@')[0] || 'current_user', // Use email prefix as username
      fullName: profile.full_name || 'Current User',
      avatar: profile.avatar_url || undefined, // Ensure it's not null
      weeklyXP: 740, // Example value
      level: 14,
      rank: 0, // Will be calculated
      isCurrentUser: true
    };
    
    // Make a copy of the leaderboard
    const leaderboard = [...sampleLeaderboard];
    
    // Remove any entries that might have the same ID as current user
    const filteredLeaderboard = leaderboard.filter(user => user.id !== currentUserEntry.id);
    
    // Add current user
    const mergedLeaderboard = [...filteredLeaderboard, currentUserEntry];
    
    // Sort by XP and assign ranks
    return mergedLeaderboard
      .sort((a, b) => b.weeklyXP - a.weeklyXP)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  };

  const leaderboard = getLeaderboardWithCurrentUser();

  const renderRankBadge = (rank: number) => {
    let badgeStyle = styles.rankBadge;
    let textStyle = styles.rankText;
    let iconName = null;
    
    if (rank === 1) {
      badgeStyle = {...badgeStyle, ...styles.firstPlace};
      iconName = 'star';
    } else if (rank === 2) {
      badgeStyle = {...badgeStyle, ...styles.secondPlace};
      iconName = 'star';
    } else if (rank === 3) {
      badgeStyle = {...badgeStyle, ...styles.thirdPlace};
      iconName = 'star';
    }
    
    return (
      <View style={badgeStyle}>
        {iconName ? (
          <Icon name={iconName} size={14} color="white" />
        ) : (
          <Text style={textStyle}>{rank}</Text>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: LeaderboardUser }) => (
    <Card 
      style={[
        styles.userCard, 
        item.isCurrentUser && styles.currentUserCard,
        { backgroundColor: item.isCurrentUser ? 
          (isDarkMode ? 'rgba(98, 0, 238, 0.15)' : 'rgba(98, 0, 238, 0.05)') : 
          theme.cardColor 
        }
      ]}
    >
      <View style={styles.userItem}>
        {renderRankBadge(item.rank)}
        
        <Avatar.Image 
          size={50} 
          source={item.avatar ? { uri: item.avatar } : require('../../../assets/images/default-avatar.png')} 
          style={styles.userAvatar}
        />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.textColor }]}>{item.fullName}</Text>
          <Text style={styles.userLevel}>Level {item.level}</Text>
        </View>
        
        <View style={styles.xpContainer}>
          <Icon name="zap" size={16} color={theme.primaryColor} style={styles.xpIcon} />
          <Text style={[styles.xpValue, { color: theme.primaryColor }]}>{item.weeklyXP}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    </Card>
  );

  const ListHeader = () => (
    <View style={styles.leaderboardHeader}>
      <View style={styles.weekInfo}>
        <Text style={[styles.weekTitle, { color: theme.textColor }]}>This Week's Leaderboard</Text>
        <Text style={styles.weekDates}>Nov 13 - Nov 19</Text>
      </View>
      <View style={[styles.headerXpInfo, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
        <Icon name="zap" size={16} color={theme.primaryColor} />
        <Text style={[styles.headerXpText, { color: theme.secondaryColor }]}>Weekly XP</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <AppHeader
        title="Leaderboard"
        showSettings={true}
      />
      
      <FlatList
        data={leaderboard}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  leaderboardHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekDates: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  headerXpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerXpText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  userCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  currentUserCard: {
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#777',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  firstPlace: {
    backgroundColor: '#FFD700',
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userAvatar: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpIcon: {
    marginRight: 4,
  },
  xpValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  xpLabel: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
}); 