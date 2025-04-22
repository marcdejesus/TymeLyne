import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Component for displaying a message conversation in the messages list
 * 
 * @param {object} message - Message object containing username, text, time
 * @param {function} onPress - Function to call when pressed
 */
const MessageListItem = ({ message, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={require('../../assets/default-avatar.png')} 
        style={styles.avatar}
      />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>{message.username}</Text>
          <Text style={styles.time}>{message.time}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1}>
          {message.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default MessageListItem; 