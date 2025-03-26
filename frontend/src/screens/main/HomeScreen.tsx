import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card, Avatar, Divider, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/layout/AppHeader';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';

// Types for our feed items
interface FeedPost {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
  tags?: string[];
  xpEarned?: number;
  achievementUnlocked?: {
    name: string;
    icon: string;
  };
  goalCompleted?: {
    title: string;
    progress: number;
  };
}

// Sample feed data
const sampleFeed: FeedPost[] = [
  {
    id: '1',
    userId: '101',
    username: 'sarah_fitness',
    userFullName: 'Sarah Johnson',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    content: 'Just completed my morning run! 🏃‍♀️ Making great progress on my fitness goals this month.',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
    likes: 42,
    comments: 7,
    timestamp: '35m',
    liked: false,
    xpEarned: 50,
    tags: ['fitness', 'running', 'goals'],
  },
  {
    id: '2',
    userId: '102',
    username: 'tech_mike',
    userFullName: 'Mike Chen',
    userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    content: 'Reached level 15 today! Been consistently coding every day this week.',
    likes: 28,
    comments: 4,
    timestamp: '1h',
    liked: true,
    achievementUnlocked: {
      name: 'Code Warrior',
      icon: 'code',
    },
  },
  {
    id: '3',
    userId: '103',
    username: 'bookworm_emma',
    userFullName: 'Emma Williams',
    userAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    content: 'Finished my reading goal for the month! 📚 Thanks to everyone who recommended books.',
    likes: 35,
    comments: 12,
    timestamp: '3h',
    liked: false,
    goalCompleted: {
      title: 'Read 5 books this month',
      progress: 1.0,
    },
    xpEarned: 100,
  },
  {
    id: '4',
    userId: '104',
    username: 'alex_guitar',
    userFullName: 'Alex Rodriguez',
    userAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    content: 'Just hit a 7-day streak on my guitar practice! Learning that new song is getting easier.',
    imageUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0',
    likes: 19,
    comments: 3,
    timestamp: '5h',
    liked: false,
    xpEarned: 70,
  },
  {
    id: '5',
    userId: '105',
    username: 'yoga_jen',
    userFullName: 'Jennifer Smith',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    content: 'Made it to level 10! Yoga practice is really paying off for my flexibility and peace of mind.',
    likes: 51,
    comments: 8,
    timestamp: '7h',
    liked: true,
    achievementUnlocked: {
      name: 'Zen Master',
      icon: 'heart',
    },
    xpEarned: 150,
  },
  {
    id: '6',
    userId: '106',
    username: 'cooking_dave',
    userFullName: 'David Brown',
    userAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    content: 'Completed my healthy cooking goal! Been meal prepping all week and feeling great!',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    likes: 31,
    comments: 5,
    timestamp: '9h',
    liked: false,
    goalCompleted: {
      title: 'Cook healthy meals at home all week',
      progress: 1.0,
    },
  },
  {
    id: '7',
    userId: '107',
    username: 'language_lisa',
    userFullName: 'Lisa Wong',
    userAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    content: 'Day 30 of my Spanish learning challenge! Estoy muy orgullosa de mi progreso! 🇪🇸',
    likes: 45,
    comments: 9,
    timestamp: '11h',
    liked: true,
    xpEarned: 120,
    tags: ['learning', 'Spanish', 'languages'],
  },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState(sampleFeed);

  // Simulate fetching feed data when the component mounts
  useEffect(() => {
    // In a real app, this would fetch data from an API
    console.log('Fetching feed data for user:', profile?.id);
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Randomize some likes/comments to simulate fresh content
      const updatedFeed = feed.map(post => ({
        ...post,
        likes: post.likes + Math.floor(Math.random() * 3),
        comments: post.comments + Math.floor(Math.random() * 2),
      }));
      setFeed(updatedFeed);
      setRefreshing(false);
    }, 1500);
  };

  const toggleLike = (postId: string) => {
    const updatedFeed = feed.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    });
    setFeed(updatedFeed);
  };

  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAchievement = (achievement?: { name: string; icon: string }) => {
    if (!achievement) return null;
    
    return (
      <View style={[styles.achievementCard, { backgroundColor: theme.cardColor }]}>
        <View style={styles.achievementIcon}>
          <Icon name={achievement.icon} size={20} color={theme.primaryColor} />
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: theme.textColor }]}>Achievement Unlocked!</Text>
          <Text style={styles.achievementName}>{achievement.name}</Text>
        </View>
      </View>
    );
  };

  const renderGoalCompleted = (goal?: { title: string; progress: number }) => {
    if (!goal) return null;
    
    return (
      <View style={[styles.goalCard, { backgroundColor: theme.cardColor }]}>
        <View style={styles.goalIcon}>
          <Icon name="target" size={20} color={theme.primaryColor} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, { color: theme.textColor }]}>Goal Completed!</Text>
          <Text style={styles.goalName}>{goal.title}</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${goal.progress * 100}%`, backgroundColor: theme.primaryColor }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderXpEarned = (xp?: number) => {
    if (!xp) return null;
    
    return (
      <View style={[styles.xpCard, { backgroundColor: isDarkMode ? 'rgba(98, 0, 238, 0.15)' : 'rgba(98, 0, 238, 0.05)' }]}>
        <Icon name="zap" size={16} color={theme.primaryColor} />
        <Text style={[styles.xpText, { color: theme.primaryColor }]}>+{xp} XP Earned</Text>
      </View>
    );
  };

  const renderPostItem = ({ item }: { item: FeedPost }) => (
    <Card style={[styles.postCard, { backgroundColor: theme.cardColor }]}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Avatar.Image 
            size={40} 
            source={item.userAvatar ? { uri: item.userAvatar } : require('../../../assets/images/default-avatar.png')} 
          />
          <View style={styles.userTextInfo}>
            <Text style={[styles.userName, { color: theme.textColor }]}>{item.userFullName}</Text>
            <Text style={styles.userHandle}>@{item.username} · {item.timestamp}</Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: theme.textColor }]}>{item.content}</Text>
      
      {renderTags(item.tags)}
      
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      )}
      
      {renderAchievement(item.achievementUnlocked)}
      {renderGoalCompleted(item.goalCompleted)}
      {renderXpEarned(item.xpEarned)}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => toggleLike(item.id)}
        >
          <Icon 
            name={item.liked ? "heart" : "heart"} 
            size={20} 
            color={item.liked ? "#e74c3c" : "#777"} 
            style={[item.liked && { fontWeight: 'bold' }]}
          />
          <Text style={[styles.actionText, item.liked && { color: "#e74c3c" }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="message-circle" size={20} color="#777" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={20} color="#777" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const ListHeader = () => (
    <Card style={[styles.createPostCard, { backgroundColor: theme.cardColor }]}>
      <View style={styles.createPostContent}>
        <Avatar.Image 
          size={40} 
          source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/images/default-avatar.png')} 
        />
        <TouchableOpacity 
          style={[styles.createPostInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => console.log('Open post creation')}
        >
          <Text style={{ color: isDarkMode ? '#aaa' : '#777' }}>What's on your mind?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.createPostActions}>
        <Button 
          mode="text" 
          icon="image" 
          textColor={theme.primaryColor}
          onPress={() => console.log('Add image')}
        >
          Photo
        </Button>
        <Button 
          mode="text" 
          icon="target" 
          textColor={theme.primaryColor}
          onPress={() => console.log('Add goal update')}
        >
          Goal
        </Button>
        <Button 
          mode="text" 
          icon="award" 
          textColor={theme.primaryColor}
          onPress={() => console.log('Add achievement')}
        >
          Achievement
        </Button>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <AppHeader 
        title="Dashboard"
        showSettings={true}
        onSettingsPress={() => console.log('Settings pressed')}
      />
      
      <FlatList
        data={feed}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  createPostCard: {
    marginBottom: 16,
    padding: 12,
  },
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  createPostInput: {
    flex: 1,
    marginLeft: 10,
    padding: 12,
    borderRadius: 20,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingTop: 8,
  },
  postCard: {
    marginBottom: 16,
    padding: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userHandle: {
    color: '#777',
    fontSize: 13,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 5,
    color: '#777',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#6200ee',
    fontSize: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.3)',
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementName: {
    color: '#6200ee',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.3)', 
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalName: {
    color: '#6200ee',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  xpText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 