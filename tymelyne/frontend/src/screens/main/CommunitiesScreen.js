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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * CommunitiesScreen - Shows and manages user communities
 */
const CommunitiesScreen = () => {
  const navigation = useNavigation();
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('joined'); // 'joined', 'discover', 'created'
  const [modalVisible, setModalVisible] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });
  
  // Demo communities
  const [joinedCommunities, setJoinedCommunities] = useState([
    { id: '1', name: 'Python Learners', members: 2456, posts: 132, joined: true },
    { id: '2', name: 'JavaScript Masters', members: 1897, posts: 89, joined: true },
  ]);
  
  const [discoverCommunities, setDiscoverCommunities] = useState([
    { id: '3', name: 'React Native Devs', members: 3421, posts: 245, joined: false },
    { id: '4', name: 'UI/UX Design', members: 5678, posts: 432, joined: false },
    { id: '5', name: 'Machine Learning', members: 7890, posts: 567, joined: false },
  ]);
  
  const [createdCommunities, setCreatedCommunities] = useState([
    { id: '6', name: 'My Study Group', members: 15, posts: 27, joined: true, isCreator: true },
  ]);
  
  // Handle search
  const handleSearch = (text) => {
    setSearchText(text);
    // In a real app, you would fetch search results from the backend
    console.log('Searching for:', text);
  };
  
  // Handle join/leave community
  const handleToggleJoin = (communityId, currentTab) => {
    if (currentTab === 'joined') {
      // Leave the community
      const community = joinedCommunities.find(c => c.id === communityId);
      if (community) {
        setJoinedCommunities(joinedCommunities.filter(c => c.id !== communityId));
        setDiscoverCommunities([...discoverCommunities, { ...community, joined: false }]);
      }
    } else if (currentTab === 'discover') {
      // Join the community
      const community = discoverCommunities.find(c => c.id === communityId);
      if (community) {
        setDiscoverCommunities(discoverCommunities.filter(c => c.id !== communityId));
        setJoinedCommunities([...joinedCommunities, { ...community, joined: true }]);
      }
    }
  };
  
  // Handle view community
  const handleViewCommunity = (communityId) => {
    console.log('View community:', communityId);
    // Navigate to community detail screen (would be implemented in a real app)
  };
  
  // Handle create community
  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim()) {
      Alert.alert('Error', 'Community name is required');
      return;
    }
    
    // In a real app, you would send this to the backend
    const newId = Math.random().toString(36).substring(2, 9);
    const createdCommunity = {
      id: newId,
      name: newCommunity.name,
      description: newCommunity.description,
      members: 1,
      posts: 0,
      joined: true,
      isCreator: true,
      isPrivate: newCommunity.isPrivate,
    };
    
    setCreatedCommunities([...createdCommunities, createdCommunity]);
    setJoinedCommunities([...joinedCommunities, createdCommunity]);
    
    // Reset form and close modal
    setNewCommunity({
      name: '',
      description: '',
      isPrivate: false,
    });
    setModalVisible(false);
  };
  
  // Render community item
  const renderCommunityItem = ({ item, currentTab }) => (
    <TouchableOpacity 
      style={styles.communityItem}
      onPress={() => handleViewCommunity(item.id)}
    >
      <View style={styles.communityInfo}>
        <View style={[styles.communityIcon, { backgroundColor: accentColor }]}>
          <Text style={styles.communityInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.communityDetails}>
          <Text style={styles.communityName}>{item.name}</Text>
          <Text style={styles.communityStats}>
            {item.members} members • {item.posts} posts
          </Text>
        </View>
      </View>
      
      {item.isCreator ? (
        <View style={styles.creatorBadge}>
          <Text style={[styles.creatorText, { color: accentColor }]}>Creator</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.joinButton, 
            item.joined && [styles.leaveButton, { borderColor: accentColor }],
            !item.joined && { backgroundColor: accentColor }
          ]}
          onPress={() => handleToggleJoin(item.id, currentTab)}
        >
          <Text style={[
            styles.joinButtonText,
            item.joined && { color: accentColor }
          ]}>
            {item.joined ? 'Leave' : 'Join'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
  
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'joined') {
      return (
        <FlatList
          data={joinedCommunities}
          renderItem={({ item }) => renderCommunityItem({ item, currentTab: 'joined' })}
          keyExtractor={item => item.id}
          style={styles.communitiesList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You haven't joined any communities yet.
            </Text>
          }
        />
      );
    } else if (activeTab === 'discover') {
      return (
        <>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={accentColor} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          <FlatList
            data={discoverCommunities}
            renderItem={({ item }) => renderCommunityItem({ item, currentTab: 'discover' })}
            keyExtractor={item => item.id}
            style={styles.communitiesList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No communities found</Text>
            }
          />
        </>
      );
    } else if (activeTab === 'created') {
      return (
        <FlatList
          data={createdCommunities}
          renderItem={({ item }) => renderCommunityItem({ item, currentTab: 'created' })}
          keyExtractor={item => item.id}
          style={styles.communitiesList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You haven't created any communities yet.
            </Text>
          }
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'joined' && [styles.activeTabButton, { borderBottomColor: accentColor }]]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && { color: accentColor, fontWeight: 'bold' }]}>
            Joined
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'discover' && [styles.activeTabButton, { borderBottomColor: accentColor }]]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && { color: accentColor, fontWeight: 'bold' }]}>
            Discover
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'created' && [styles.activeTabButton, { borderBottomColor: accentColor }]]}
          onPress={() => setActiveTab('created')}
        >
          <Text style={[styles.tabText, activeTab === 'created' && { color: accentColor, fontWeight: 'bold' }]}>
            Created
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {renderContent()}
      
      {/* Create Community Button */}
      <TouchableOpacity 
        style={[styles.createButton, { backgroundColor: accentColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#1E1E1E" />
      </TouchableOpacity>
      
      {/* Create Community Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Community</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={accentColor} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Community Name*</Text>
              <TextInput
                style={styles.input}
                value={newCommunity.name}
                onChangeText={(text) => setNewCommunity({...newCommunity, name: text})}
                placeholderTextColor="#999"
                placeholder="Enter community name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newCommunity.description}
                onChangeText={(text) => setNewCommunity({...newCommunity, description: text})}
                placeholderTextColor="#999"
                placeholder="What is this community about?"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Private Community</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  newCommunity.isPrivate && [styles.toggleButtonActive, { backgroundColor: accentColor }]
                ]}
                onPress={() => setNewCommunity({
                  ...newCommunity,
                  isPrivate: !newCommunity.isPrivate
                })}
              >
                <View style={[
                  styles.toggleCircle,
                  newCommunity.isPrivate && styles.toggleCircleActive
                ]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.createCommunityButton, { backgroundColor: accentColor }]}
              onPress={handleCreateCommunity}
            >
              <Text style={styles.createCommunityButtonText}>Create Community</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: '#333',
  },
  tabText: {
    color: '#999',
    fontSize: 16,
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
  communitiesList: {
    flex: 1,
  },
  communityItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  communityInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  communityStats: {
    color: '#999',
    fontSize: 14,
  },
  joinButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: DEFAULT_ACCENT_COLOR,
  },
  leaveButtonText: {
    color: DEFAULT_ACCENT_COLOR,
  },
  creatorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  creatorText: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    padding: 5,
  },
  toggleButtonActive: {
    backgroundColor: DEFAULT_ACCENT_COLOR,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    marginLeft: 'auto',
  },
  createCommunityButton: {
    backgroundColor: DEFAULT_ACCENT_COLOR,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createCommunityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommunitiesScreen; 