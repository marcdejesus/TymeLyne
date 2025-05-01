import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions
} from 'react-native';
import Screen from '../components/Screen';
import MessageListItem from '../components/MessageListItem';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

const MessagesScreen = ({ navigation }) => {
  // Mock message data
  const messages = [
    {
      id: '1',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '2',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '3',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '4',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '5',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '6',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '7',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '8',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '9',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    },
    {
      id: '10',
      username: '@username',
      text: 'Lorem ipsum dolor',
      time: '12m'
    }
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMessagePress = (messageId) => {
    navigation.navigate('Conversation', { messageId });
  };

  const renderItem = ({ item }) => (
    <MessageListItem 
      message={item} 
      onPress={() => handleMessagePress(item.id)}
    />
  );

  return (
    <Screen
      title="Messages"
      onBackPress={handleBackPress}
      backgroundColor="#F9F1E0"
      showBottomNav={false}
      scrollable={false}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.card,
  }
});

export default MessagesScreen; 