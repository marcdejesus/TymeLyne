import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const isIphoneWithNotch = Platform.OS === 'ios' && height > 800;

/**
 * Reusable header component for navigation bars across the app
 * 
 * @param {string} title - The title to display in the header
 * @param {function} onBackPress - Function to call when back button is pressed (if null, no back button is shown)
 * @param {function} onMenuPress - Function to call when menu button is pressed (if null, no menu button is shown)
 * @param {function} onRightPress - Function to call when right button is pressed (if null, no right button is shown)
 * @param {string} rightIcon - Icon name for the right button (default is "chevron-forward")
 * @param {string} backgroundColor - Background color for the header
 * @param {boolean} useLightIcons - Whether to use light colored icons (for dark backgrounds)
 * @param {object} style - Additional styles for the header container
 */
const Header = ({
  title,
  onBackPress,
  onMenuPress,
  onRightPress,
  rightIcon = "chevron-forward",
  backgroundColor = colors.background,
  useLightIcons = false,
  style
}) => {
  const iconColor = useLightIcons ? colors.textInverted : colors.text;
  
  // Determine what to show on the left side of the header
  const renderLeftSide = () => {
    if (onBackPress) {
      return (
        <TouchableOpacity 
          style={styles.touchableIcon} 
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      );
    }
    
    if (onMenuPress) {
      return (
        <TouchableOpacity 
          style={styles.touchableIcon} 
          onPress={onMenuPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      );
    }
    
    // Empty view for spacing when no button
    return <View style={styles.touchableIcon} />;
  };
  
  // Determine what to show on the right side of the header
  const renderRightSide = () => {
    if (onRightPress) {
      return (
        <TouchableOpacity 
          style={styles.touchableIcon} 
          onPress={onRightPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={rightIcon} size={24} color={iconColor} />
        </TouchableOpacity>
      );
    }
    
    // Empty view for spacing when no button
    return <View style={styles.touchableIcon} />;
  };
  
  return (
    <View style={[
      styles.header, 
      { backgroundColor }, 
      style
    ]}>
      {renderLeftSide()}
      
      <Text style={[styles.headerTitle, { color: iconColor }]} numberOfLines={1}>
        {title}
      </Text>
      
      {renderRightSide()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: Platform.OS === 'ios' ? 60 : 56,
  },
  touchableIcon: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Math.min(18, width * 0.05),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
});

export default Header; 