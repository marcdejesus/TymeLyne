import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Reusable Card component for containing content
 * 
 * @param {node} children - Child components to render inside the card
 * @param {function} onPress - Function to call when card is pressed (makes card touchable)
 * @param {object} style - Additional styles for the card
 * @param {string} backgroundColor - Background color of the card
 * @param {number} elevation - Elevation/shadow intensity (1-5)
 */
const Card = ({
  children,
  onPress,
  style,
  backgroundColor = colors.card,
  elevation = 2
}) => {
  // Shadow styles based on elevation
  const getShadowStyle = () => {
    const shadowOpacity = 0.08 * elevation;
    const shadowRadius = elevation;
    const shadowOffset = { width: 0, height: elevation / 2 };
    
    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset,
        shadowOpacity,
        shadowRadius,
      },
      android: {
        elevation,
      },
    });
  };
  
  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          getShadowStyle(),
          { backgroundColor },
          style
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  // Otherwise render as a View
  return (
    <View
      style={[
        styles.card,
        getShadowStyle(),
        { backgroundColor },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
  },
});

export default Card; 