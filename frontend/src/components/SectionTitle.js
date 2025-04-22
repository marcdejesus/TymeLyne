import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';

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
    paddingHorizontal: width * 0.04,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#4A4A3A',
  },
  rightText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#D35C34',
    fontWeight: '500',
  },
});

export default SectionTitle; 