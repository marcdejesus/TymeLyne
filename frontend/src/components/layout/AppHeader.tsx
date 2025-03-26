import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Badge, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
  title: string;
  userRole?: string;
  username: string;
  avatarUrl?: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  showNotificationsButton?: boolean;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  backButton?: boolean;
  onBackPress?: () => void;
}

const AppHeader = ({
  title,
  userRole = 'USER',
  username,
  avatarUrl,
  showBackButton = false,
  showSettingsButton = false,
  showNotificationsButton = false,
  onSettingsPress,
  onNotificationsPress,
  backButton = false,
  onBackPress,
}: AppHeaderProps) => {
  const navigation = useNavigation();

  // Determine if we should show a back button
  const shouldShowBackButton = showBackButton || backButton;
  
  // Use the provided onBackPress function or fallback to navigation.goBack
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {shouldShowBackButton ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        ) : null}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.headerRight}>
          {showSettingsButton && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onSettingsPress}
            >
              <Icon name="settings" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          {showNotificationsButton && (
            <View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onNotificationsPress}
              >
                <Icon name="bell" size={24} color="#fff" />
              </TouchableOpacity>
              <Badge visible={true} size={8} style={styles.notificationBadge} />
            </View>
          )}
          
          {!showSettingsButton && !showNotificationsButton && (
            <>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{userRole}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('Profile' as never)}
              >
                {avatarUrl ? (
                  <Avatar.Image source={{ uri: avatarUrl }} size={40} />
                ) : (
                  <Avatar.Text 
                    size={40} 
                    label={username.substring(0, 2).toUpperCase()} 
                    color="#fff"
                    style={{ backgroundColor: "#6200ee" }}
                  />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4081',
  },
});

export default AppHeader; 