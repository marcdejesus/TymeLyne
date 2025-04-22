import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import Typography from './Typography';

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
  const iconColor = useLightIcons ? colors.text.inverted : colors.text.primary;
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor },
      style
    ]}>
      {/* Left button (back or menu) */}
      {onBackPress ? (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : onMenuPress ? (
        <TouchableOpacity 
          style={styles.button}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyButton} />
      )}
      
      {/* Title */}
      <Typography 
        variant="title" 
        weight="semiBold" 
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </Typography>
      
      {/* Right button */}
      {onRightPress ? (
        <TouchableOpacity 
          style={styles.button}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon} size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.m,
    paddingTop: isIphoneWithNotch ? spacing.s : 0,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  emptyButton: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  }
});

export default Header; 