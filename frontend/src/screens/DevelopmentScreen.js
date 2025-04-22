import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  TouchableOpacity
} from 'react-native';

const DevelopmentScreen = ({ navigation }) => {
  const handleNavigation = (screenName) => {
    if (screenName === 'Home') {
      navigation.navigate('Home');
    } else if (screenName === 'Profile') {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Development');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coming Soon</Text>
        <TouchableOpacity onPress={() => handleNavigation('Settings')}>
          <Text style={styles.settingsIcon}>⟩</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.titleText}>Feature Under Development</Text>
        
        {/* Construction Worker Image */}
        <Image 
          source={require('../../assets/favicon.png')} // Placeholder until we have the construction worker image
          style={styles.workerImage}
        />
        
        <Text style={styles.descriptionText}>
          This feature is under development and will be implemented in the full app.
        </Text>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation('Home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Achievements')}
        >
          <Text style={styles.navIcon}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0', // Beige background from the screenshots
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8C0',
  },
  menuIcon: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  settingsIcon: {
    fontSize: 24,
    color: '#4A4A3A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A3A',
    marginBottom: 20,
    textAlign: 'center',
  },
  workerImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B6B5A',
    lineHeight: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  navIcon: {
    fontSize: 24,
  },
});

export default DevelopmentScreen; 