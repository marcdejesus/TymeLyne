import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, StatusBar, Platform, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DevelopmentScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#D35C34"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Under Development</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>
          Feature Coming Soon!
        </Text>
        
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/construction.png')} 
            style={styles.constructionImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.description}>
          We're hard at work building this feature to enhance your learning experience.
          Thank you for your patience while we develop this section of the app.
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What to expect:</Text>
          <Text style={styles.infoText}>
            • Personalized learning paths{'\n'}
            • Detailed progress tracking{'\n'}
            • Achievement rewards{'\n'}
            • Social learning features{'\n'}
            • Customizable learning goals
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.backButtonLarge}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home-outline" size={24} color="#6B6B5A" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="trophy-outline" size={24} color="#6B6B5A" />
          <Text style={styles.navText}>Achievements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person-outline" size={24} color="#6B6B5A" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D35C34',
    height: 60,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40, // Same width as back button for alignment
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D35C34',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  constructionImage: {
    width: 200,
    height: 200,
  },
  description: {
    fontSize: 16,
    color: '#4A4A3A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: 'rgba(211, 92, 52, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D35C34',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D35C34',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#4A4A3A',
    lineHeight: 26,
  },
  backButtonLarge: {
    backgroundColor: '#D35C34',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
    backgroundColor: '#FFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navText: {
    fontSize: 12,
    color: '#6B6B5A',
    marginTop: 4,
  },
});

export default DevelopmentScreen; 