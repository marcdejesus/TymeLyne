import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Reusable component for section titles across the app
 * 
 * @param {string} title - The section title text
 * @param {string} rightText - Optional text to show on the right (e.g., "See All")
 * @param {function} onRightPress - Function to call when right text is pressed
 * @param {object} style - Additional styles for the container
 * @param {object} titleStyle - Additional styles for the title text
 */
const SectionTitle = ({
  title,
  rightText,
  onRightPress,
  style,
  titleStyle
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      
      {rightText && onRightPress && (
        <TouchableOpacity 
          onPress={onRightPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.rightText}>{rightText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  rightText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default SectionTitle; 