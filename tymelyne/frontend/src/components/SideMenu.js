import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Side Menu Component - Dropdown menu for the app
 */
const SideMenu = ({ visible, onClose }) => {
  const navigation = useNavigation();

  // Menu items
  const menuItems = [
    {
      id: 'leaderboards',
      label: 'Leaderboards',
      icon: 'trophy',
      onPress: () => {
        onClose();
        navigation.navigate('Leaderboards');
      },
    },
    {
      id: 'friends',
      label: 'View Friends',
      icon: 'people',
      onPress: () => {
        onClose();
        // Navigate to friends screen when implemented
        console.log('Navigate to friends');
      },
    },
    {
      id: 'communities',
      label: 'Communities',
      icon: 'people-circle',
      onPress: () => {
        onClose();
        // Navigate to communities screen when implemented
        console.log('Navigate to communities');
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onPress: () => {
        onClose();
        // Navigate to settings screen when implemented
        console.log('Navigate to settings');
      },
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.menuContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#E67E22" />
            </TouchableOpacity>
          </View>
          
          {/* Menu items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={24} color="#E67E22" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Current event notice */}
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventLabel}>Current Event:</Text>
              <Text style={styles.eventTitle}>Launch Celebration! 🎉</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventDescription}>
                Get an exclusive launch bonus from the shop and enjoy 2XP!
              </Text>
            </View>
          </View>
          
          {/* App interaction section */}
          <View style={styles.postCreation}>
            <View style={styles.inputContainer}>
              <View style={styles.avatarCircle} />
              <View style={styles.fakeInput}>
                <Text style={styles.fakeInputText}>What's on your mind?</Text>
              </View>
            </View>
            
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="camera-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="trophy-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>Achievement</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="send-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Sample post */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={styles.avatarCircle} />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>Full Name</Text>
                  <Text style={styles.authorUsername}>@username | 35m</Text>
                </View>
              </View>
            </View>
            <View style={styles.postContent}>
              <Text style={styles.postText}>
                Anyone know how to center a div??? Web development is very hard.
              </Text>
            </View>
            <View style={styles.postFooter}>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="heart-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>41 Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>7 Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="share-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
  eventCard: {
    backgroundColor: '#333',
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventHeader: {
    backgroundColor: '#E67E22',
    padding: 10,
  },
  eventLabel: {
    color: '#fff',
    fontSize: 14,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventContent: {
    padding: 10,
  },
  eventDescription: {
    color: '#ddd',
    fontSize: 14,
  },
  postCreation: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  inputContainer: {
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
  fakeInput: {
    flex: 1,
    backgroundColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  fakeInputText: {
    color: '#999',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    color: '#666',
    marginLeft: 5,
    fontSize: 12,
  },
  postCard: {
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#E67E22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorUsername: {
    color: '#999',
    fontSize: 14,
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
    borderTopColor: '#333',
    paddingTop: 10,
  },
});

export default SideMenu; 