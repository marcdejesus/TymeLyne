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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * FriendsScreen - Shows list of friends and allows adding new friends
 */
const FriendsScreen = () => {
  const navigation = useNavigation();
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
        <View style={styles.avatar} />
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
          <Ionicons name="person-remove" size={20} color="#E67E22" />
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
        <View style={styles.avatar} />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#2ecc71" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#e74c3c" />
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
        <View style={styles.avatar} />
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
          <Ionicons name="person-add" size={20} color="#E67E22" />
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
            <Ionicons name="search" size={20} color="#E67E22" style={styles.searchIcon} />
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTabButton]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'requests' && styles.activeTabButton]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'find' && styles.activeTabButton]}
          onPress={() => setActiveTab('find')}
        >
          <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>
            Find
          </Text>
        </TouchableOpacity>
      </View>
      
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#E67E22',
  },
  tabText: {
    color: '#999',
    fontSize: 16,
  },
  activeTabText: {
    color: '#E67E22',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  declineButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default FriendsScreen; 