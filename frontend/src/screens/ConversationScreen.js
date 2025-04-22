import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

// Message bubble component
const MessageBubble = ({ message, isUser }) => {
  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userBubble : styles.otherBubble
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.otherMessageText
      ]}>
        {message.text}
      </Text>
    </View>
  );
};

const ConversationScreen = ({ navigation, route }) => {
  const { messageId } = route.params;
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);
  
  // Mock conversation data
  const conversation = {
    id: messageId,
    username: '@username',
    messages: [
      {
        id: '1',
        text: 'Hey there! How are you doing?',
        isUser: false,
        timestamp: '11:30 AM'
      },
      {
        id: '2',
        text: 'I\'m good, thanks for asking! How about you?',
        isUser: true,
        timestamp: '11:32 AM'
      },
      {
        id: '3',
        text: 'I\'m doing well! Just working on the new project.',
        isUser: false,
        timestamp: '11:33 AM'
      },
      {
        id: '4',
        text: 'That sounds interesting. What kind of project is it?',
        isUser: true,
        timestamp: '11:34 AM'
      },
      {
        id: '5',
        text: 'It\'s a new mobile app for learning courses. Very exciting!',
        isUser: false,
        timestamp: '11:36 AM'
      }
    ]
  };

  const handleBackPress = () => {
    navigation.navigate('Messages');
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // In a real app, you would send this message to a backend
    // and then update the local state with the response
    
    // For now, we'll just reset the input
    setInputMessage('');
    
    // Scroll to the bottom
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderItem = ({ item }) => (
    <MessageBubble message={item} isUser={item.isUser} />
  );

  return (
    <Screen
      title={conversation.username}
      onBackPress={handleBackPress}
      backgroundColor="#F9F1E0"
      showBottomNav={false}
      scrollable={false}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={conversation.messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Message..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            activeOpacity={0.7}
            disabled={inputMessage.trim() === ''}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputMessage.trim() === '' ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardDark,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.textInverted,
  },
  otherMessageText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: colors.cardDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ConversationScreen; 