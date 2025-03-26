import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Avatar, useTheme, Badge } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  onSettingsPress?: () => void;
}

const AppHeader = ({ title, showBack = false, showSettings = false, onSettingsPress }: AppHeaderProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return (
        <Avatar.Image 
          size={40} 
          source={{ uri: profile.avatar_url }} 
        />
      );
    }
    
    return (
      <Avatar.Text 
        size={40} 
        label={profile?.full_name ? getInitials(profile.full_name) : 'U'} 
      />
    );
  };

  return (
    <Appbar.Header
      mode="center-aligned"
      style={{ backgroundColor: colors.background }}
    >
      {showBack && (
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color={colors.primary}
        />
      )}
      
      <Appbar.Content
        title={title}
        color={colors.onBackground}
      />
      
      {showSettings ? (
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
          {renderAvatar()}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightButtonSpace} />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 10,
  },
  rightButtonSpace: {
    width: 40,
    marginRight: 10,
  },
});

export default AppHeader; 