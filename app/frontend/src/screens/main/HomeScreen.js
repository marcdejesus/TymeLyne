import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * Home Screen - Main screen after authentication
 */
const HomeScreen = ({ navigation }) => {
  // Get accent color from theme context
  const { accent } = useTheme();
  
  // Mock user data instead of using Auth context
  const user = {
    name: 'John Doe',
    username: 'johndoe',
    coins: 120,
    xp: 500,
    level: 5
  };
  
  const [postText, setPostText] = useState('');

  // Demo posts
  const posts = [
    {
      id: 1,
      author: {
        name: 'Full Name',
        username: 'username',
        avatar: null,
      },
      content: 'I just finished my first Learn Path! So excited to learn more with Tyme Lyne!',
      timeAgo: '35m',
      likes: 41,
      comments: 7,
    },
  ];

  const handlePost = () => {
    console.log('New post:', postText);
    setPostText('');
    // In a real app, this would send the post to a backend
  };

  // Handle photo upload
  const handlePhotoUpload = () => {
    console.log('Upload photo pressed');
    // In a real app, this would open the camera or photo library
  };

  // Handle achievement posting
  const handleAchievement = () => {
    console.log('Achievement pressed');
    // In a real app, this would open achievement selection
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Current Event Card */}
        <View style={styles.eventCard}>
          <View style={[styles.eventHeader, { backgroundColor: accent }]}>
            <Text style={styles.eventLabel}>Current Event:</Text>
            <Text style={styles.eventTitle}>Launch Celebration! 🎉</Text>
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventDescription}>
              Get an exclusive launch bonus from the shop and enjoy 2XP!
            </Text>
          </View>
        </View>

        {/* Post Creation Area */}
        <View style={styles.createPostCard}>
          <View style={styles.createPostHeader}>
            <View style={styles.avatarCircle} />
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#999"
              value={postText}
              onChangeText={setPostText}
              multiline
            />
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction} onPress={handlePhotoUpload}>
              <Ionicons name="camera-outline" size={24} color="#666" />
              <Text style={styles.postActionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction} onPress={handleAchievement}>
              <Ionicons name="trophy-outline" size={24} color="#666" />
              <Text style={styles.postActionText}>Achievement</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.postAction} 
              onPress={handlePost}
              disabled={!postText.trim()}
            >
              <Ionicons name="send-outline" size={24} color={postText.trim() ? accent : "#666"} />
              <Text style={[styles.postActionText, postText.trim() && { color: accent }]}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Feed */}
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={styles.avatarCircle} />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <Text style={styles.authorUsername}>@{post.author.username} | {post.timeAgo}</Text>
                </View>
              </View>
            </View>
            <View style={styles.postContent}>
              <Text style={styles.postText}>{post.content}</Text>
            </View>
            <View style={styles.postFooter}>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="heart-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>{post.likes} Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>{post.comments} Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="share-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    margin: 15,
    overflow: 'hidden',
  },
  eventHeader: {
    padding: 15,
  },
  eventLabel: {
    color: '#fff',
    fontSize: 16,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventContent: {
    padding: 15,
  },
  eventDescription: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
  },
  createPostCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    margin: 15,
    padding: 15,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDDDDD',
    marginRight: 10,
  },
  postInput: {
    flex: 1,
    backgroundColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  postActionText: {
    color: '#666',
    marginLeft: 5,
    fontSize: 14,
  },
  postCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    margin: 15,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorUsername: {
    color: '#999',
    fontSize: 12,
  },
  postContent: {
    marginVertical: 10,
  },
  postText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 10,
    marginTop: 5,
  },
});

export default HomeScreen;