import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import Typography from './Typography';

const { width, height } = Dimensions.get('window');
const isIphoneX = Platform.OS === 'ios' && (height > 800 || width > 800);

/**
 * Reusable bottom navigation bar component
 * 
 * @param {string} activeScreen - The currently active screen ('Home', 'Leaderboards', 'Profile')
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
      id: 'Leaderboards',
      icon: 'trophy-outline',
      activeIcon: 'trophy',
      label: 'Leaderboards',
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
    <SafeAreaView style={{ backgroundColor: colors.card }}>
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
                color={isActive ? colors.primary : colors.text.secondary} 
              />
              <Typography 
                variant="caption"
                weight={isActive ? "semiBold" : "regular"}
                color={isActive ? "primary" : "secondary"}
                style={styles.navLabel}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingTop: 10,
    paddingBottom: isIphoneX ? 8 : 10, // Adjusted padding for notched devices
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 48, // Ensure touch targets are at least 48px tall
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    paddingTop: 0, // Adjust for the added border
  },
  navLabel: {
    marginTop: 4,
  }
});

export default BottomNavigation; 