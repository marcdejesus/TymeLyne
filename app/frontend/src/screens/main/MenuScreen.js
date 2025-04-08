import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

/**
 * MenuScreen - Provides links to various app screens
 */
const MenuScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  
  // Navigate to a screen
  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };
  
  // Group of menu items
  const menuItems = [
    {
      title: 'Social',
      items: [
        { 
          id: 'leaderboards',
          label: 'Leaderboards',
          icon: 'trophy',
          screen: 'Leaderboards',
        },
        { 
          id: 'friends',
          label: 'View Friends',
          icon: 'people',
          screen: 'Friends',
        },
        { 
          id: 'communities',
          label: 'Communities',
          icon: 'people-circle',
          screen: 'Communities',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { 
          id: 'profile',
          label: 'My Profile',
          icon: 'person',
          screen: 'Profile',
        },
        { 
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          screen: 'Settings',
        },
      ],
    },
  ];
  
  // Render a menu section
  const renderMenuSection = (section) => (
    <View key={section.title} style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      
      {section.items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => navigateTo(item.screen)}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={24} color="#E67E22" />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Image
              source={
                profile && profile.avatar 
                  ? { uri: profile.avatar } 
                  : require('../../assets/images/default-avatar.png')
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Full Name'}</Text>
              <Text style={styles.userTag}>OG</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateTo('ProfileEdit')}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {/* Menu Items */}
        {menuItems.map(renderMenuSection)}
        
        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userTag: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#E67E22',
    fontWeight: 'bold',
  },
  menuSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: 16,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default MenuScreen; 