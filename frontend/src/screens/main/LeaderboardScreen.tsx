import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { Card, Avatar, Divider } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Define the leaderboard item type
interface LeaderboardItem {
  id: string;
  username: string;
  score: number;
  rank: number;
  avatar: string | null;
}

// Dummy data for leaderboard
const LEADERBOARD_DATA: LeaderboardItem[] = [
  {
    id: '1',
    username: 'AliceWonder',
    score: 1250,
    rank: 1,
    avatar: null,
  },
  {
    id: '2',
    username: 'BobBuilder',
    score: 980,
    rank: 2,
    avatar: null,
  },
  {
    id: '3',
    username: 'CharlieCoder',
    score: 875,
    rank: 3,
    avatar: null,
  },
  {
    id: '4',
    username: 'DianaDev',
    score: 790,
    rank: 4,
    avatar: null,
  },
  {
    id: '5',
    username: 'EricGamer',
    score: 720,
    rank: 5,
    avatar: null,
  },
];

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState(LEADERBOARD_DATA);
  
  useEffect(() => {
    // Fetch leaderboard data here
    // For now, using dummy data
    console.log('Fetching leaderboard data...');
  }, []);

  const renderItem = ({ item }: { item: LeaderboardItem }) => (
    <Card 
      style={[
        styles.card, 
        { backgroundColor: theme.cardColor }
      ]}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.rank, { color: theme.primaryColor }]}>#{item.rank}</Text>
        
        <Avatar.Text 
          size={40} 
          label={item.username.substring(0, 2).toUpperCase()} 
          style={{ marginHorizontal: 10 }}
        />
        
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: theme.textColor }]}>
            {item.username}
          </Text>
          <Text style={[styles.score, { color: theme.secondaryColor }]}>
            {item.score} points
          </Text>
        </View>
        
        {/* Medal for top 3 */}
        {item.rank <= 3 && (
          <View style={styles.medalContainer}>
            <Image 
              source={
                item.rank === 1 
                  ? require('../../../assets/gold-medal.png') 
                  : item.rank === 2 
                    ? require('../../../assets/silver-medal.png') 
                    : require('../../../assets/bronze-medal.png')
              } 
              style={styles.medal}
            />
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.primaryColor }]}>Leaderboard</Text>
      
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => `leaderboard-item-${item.id}`}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 8,
    elevation: 2,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rank: {
    fontWeight: 'bold',
    fontSize: 18,
    width: 40,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  score: {
    fontSize: 14,
  },
  medalContainer: {
    marginLeft: 8,
  },
  medal: {
    width: 24,
    height: 24,
  },
}); 