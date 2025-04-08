import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * FriendsScreen - Shows list of friends and allows adding new friends
 */
const FriendsScreen = () => {
  const navigation = useNavigation();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'find'
  
  // Demo friends list
  const [friends, setFriends] = useState([
    { id: '1', name: 'John Doe', username: 'johndoe', level: 42 },
    { id: '2', name: 'Jane Smith', username: 'janesmith', level: 36 },
    { id: '3', name: 'Bob Johnson', username: 'bobby', level: 29 },
  ]);
  
  // Demo friend requests
  const [friendRequests, setFriendRequests] = useState([
    { id: '4', name: 'Alice Williams', username: 'alicew', level: 18 },
    { id: '5', name: 'Charlie Brown', username: 'charlieb', level: 24 },
  ]);
  
  // Demo search results
  const [searchResults, setSearchResults] = useState([
    { id: '6', name: 'David Miller', username: 'davidm', level: 31 },
    { id: '7', name: 'Emma Wilson', username: 'emmaw', level: 27 },
  ]);
  
  // Handle search
  const handleSearch = (text) => {
    setSearchText(text);
    // In a real app, you would fetch search results from the backend
    console.log('Searching for:', text);
  };
  
  // Handle view profile
  const handleViewProfile = (userId) => {
    navigation.navigate('Profile', { userId });
  };
  
  // Handle accept friend request
  const handleAcceptRequest = (userId) => {
    // Find the user in friend requests
    const user = friendRequests.find(req => req.id === userId);
    if (user) {
      // Add to friends list
      setFriends([...friends, user]);
      // Remove from requests
      setFriendRequests(friendRequests.filter(req => req.id !== userId));
    }
  };
  
  // Handle decline friend request
  const handleDeclineRequest = (userId) => {
    // Remove from requests
    setFriendRequests(friendRequests.filter(req => req.id !== userId));
  };
  
  // Handle remove friend
  const handleRemoveFriend = (userId) => {
    // Remove from friends list
    setFriends(friends.filter(friend => friend.id !== userId));
  };
  
  // Handle send friend request
  const handleSendRequest = (userId) => {
    console.log('Sending friend request to:', userId);
    // In a real app, this would send a request to the backend
  };
  
  // Render friend item
  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity 
        style={styles.friendInfo}
        onPress={() => handleViewProfile(item.id)}
      >
        <Image 
          source={item.avatar ? { uri: item.avatar } : require('../../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.friendActions}>
        <Text style={styles.levelText}>Lvl {item.level}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item.id)}
        >
          <Ionicons name="person-remove" size={20} color={accentColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render friend request item
  const renderRequestItem = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity 
        style={styles.friendInfo}
        onPress={() => handleViewProfile(item.id)}
      >
        <Image 
          source={item.avatar ? { uri: item.avatar } : require('../../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: accentColor }]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render search result item
  const renderSearchResultItem = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity 
        style={styles.friendInfo}
        onPress={() => handleViewProfile(item.id)}
      >
        <Image 
          source={item.avatar ? { uri: item.avatar } : require('../../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.friendActions}>
        <Text style={styles.levelText}>Lvl {item.level}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSendRequest(item.id)}
        >
          <Ionicons name="person-add" size={20} color={accentColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'friends') {
      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          style={styles.friendsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No friends yet. Add some!</Text>
          }
        />
      );
    } else if (activeTab === 'requests') {
      return (
        <FlatList
          data={friendRequests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          style={styles.friendsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending friend requests</Text>
          }
        />
      );
    } else if (activeTab === 'find') {
      return (
        <>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={accentColor} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username or name"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id}
            style={styles.friendsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No results found</Text>
            }
          />
        </>
      );
    }
  };

  /**
   * Renders the tab navigation at the top of the screen
   */
  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'friends' && { 
              ...styles.activeTab, 
              borderBottomColor: accentColor 
            }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && { 
                ...styles.activeTabText,
                color: accentColor 
              }
            ]}
          >
            My Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'requests' && { 
              ...styles.activeTab, 
              borderBottomColor: accentColor 
            }
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'requests' && { 
                ...styles.activeTabText,
                color: accentColor 
              }
            ]}
          >
            Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'find' && { 
              ...styles.activeTab, 
              borderBottomColor: accentColor 
            }
          ]}
          onPress={() => setActiveTab('find')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'find' && { 
                ...styles.activeTabText,
                color: accentColor 
              }
            ]}
          >
            Find Friends
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Buttons */}
      {renderTabs()}
      
      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    color: '#999',
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDDDDD',
    marginRight: 15,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendUsername: {
    color: '#999',
    fontSize: 14,
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
  },
  levelText: {
    color: '#E67E22',
    fontSize: 14,
    marginRight: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#333',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateAction: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FriendsScreen; 