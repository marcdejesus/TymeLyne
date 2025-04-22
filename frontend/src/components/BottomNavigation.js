import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isIphoneX = Platform.OS === 'ios' && (height > 800 || width > 800);

/**
 * Reusable bottom navigation bar component
 * 
 * @param {string} activeScreen - The currently active screen ('Home', 'Achievements', 'Profile')
 * @param {function} onHomePress - Function to call when Home tab is pressed
 * @param {function} onAchievementsPress - Function to call when Achievements tab is pressed
 * @param {function} onProfilePress - Function to call when Profile tab is pressed
 * @param {object} style - Additional styles for the navigation container
 */
const BottomNavigation = ({
  activeScreen,
  onHomePress,
  onAchievementsPress,
  onProfilePress,
  style
}) => {
  // Configuration for the navigation items
  const navItems = [
    {
      id: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      label: 'Home',
      onPress: onHomePress
    },
    {
      id: 'Achievements',
      icon: 'trophy-outline',
      activeIcon: 'trophy',
      label: 'Achievements',
      onPress: onAchievementsPress
    },
    {
      id: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      label: 'Profile',
      onPress: onProfilePress
    }
  ];

  return (
    <View style={[styles.container, style]}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        const iconName = isActive ? item.activeIcon : item.icon;
        
        return (
          <TouchableOpacity 
            key={item.id}
            style={[
              styles.navItem,
              isActive && styles.activeNavItem
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isActive ? '#D35C34' : '#4A4A3A'} 
            />
            <Text 
              style={[
                styles.navLabel,
                isActive && styles.activeNavLabel
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0D8C0',
    backgroundColor: '#F9F1E0',
    paddingBottom: isIphoneX ? 20 : 0, // Extra padding for notched devices
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#D35C34',
  },
  navLabel: {
    fontSize: 12,
    color: '#4A4A3A',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#D35C34',
    fontWeight: '500',
  }
});

export default BottomNavigation; 