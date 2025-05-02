import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const ActivityFeedItem = ({ activity }) => {
  const [liked, setLiked] = useState(activity.isLiked || false);
  const [likesCount, setLikesCount] = useState(activity.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  
  // Format the timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // For simplicity, let's just return a static value for now
    // In a real implementation, this would calculate time difference
    return activity.timeAgo || '1h ago';
  };
  
  // Handle like press
  const handleLikePress = () => {
    // In a real app, this would call an API to record the like
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  
  // Handle comment press
  const handleCommentPress = () => {
    setShowComments(!showComments);
    // In a real app, this would load comments from an API
  };
  
  // Determine activity icon based on type
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'course_completion':
        return <Ionicons name="school" size={20} color={colors.primary} />;
      case 'section_completion':
        return <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
      case 'level_up':
        return <Ionicons name="trophy" size={20} color="#FFD700" />;
      default:
        return <Ionicons name="star" size={20} color={colors.primary} />;
    }
  };
  
  // Determine activity title based on type
  const getActivityTitle = () => {
    switch (activity.type) {
      case 'course_completion':
        return `Completed course: ${activity.title}`;
      case 'section_completion':
        return `Completed section: ${activity.title}`;
      case 'level_up':
        return `Reached Level ${activity.level}`;
      default:
        return activity.title || 'Activity';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getActivityIcon()}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{getActivityTitle()}</Text>
          <Text style={styles.timeAgo}>{formatTime(activity.timestamp)}</Text>
        </View>
      </View>
      
      {activity.xpEarned > 0 && (
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={22} 
            color={liked ? colors.error : colors.text.secondary} 
          />
          {likesCount > 0 && (
            <Text style={styles.actionText}>{likesCount}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleCommentPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chatbubble-outline" 
            size={22} 
            color={colors.text.secondary} 
          />
          {activity.commentsCount > 0 && (
            <Text style={styles.actionText}>{activity.commentsCount}</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {showComments && activity.comments && activity.comments.length > 0 && (
        <View style={styles.commentsContainer}>
          {activity.comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Image 
                source={comment.avatar || require('../../assets/default-avatar.png')} 
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{comment.username}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  xpContainer: {
    backgroundColor: 'rgba(83, 177, 177, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#53B1B1',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.text.secondary,
  },
  commentsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 8,
    borderRadius: 8,
  },
  commentUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: colors.text,
  },
});

export default ActivityFeedItem; 