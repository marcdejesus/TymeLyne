import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView
} from 'react-native';
import { Screen, theme } from '../components';

const DevelopmentScreen = ({ navigation }) => {
  return (
    <Screen
      title="Under Development"
      onBackPress={() => navigation.goBack()}
      activeScreen="Home"
      onHomePress={() => navigation.navigate('Home')}
      onAchievementsPress={() => navigation.navigate('Leaderboards')}
      onProfilePress={() => navigation.navigate('Profile')}
      backgroundColor={theme.colors.background.main}
    >
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.l,
  },
  constructionImage: {
    width: 200,
    height: 200,
  },
  description: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  infoText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    lineHeight: 26,
  },
  backButtonLarge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.l,
    ...theme.shadows.small,
  },
  backButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default DevelopmentScreen; 