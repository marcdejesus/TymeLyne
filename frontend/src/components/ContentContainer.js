import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Reusable component for containing the main content of a screen
 * with consistent padding and scrolling behavior
 * 
 * @param {node} children - Child components to render inside the container
 * @param {boolean} scrollable - Whether content should be scrollable
 * @param {boolean} showsVerticalScrollIndicator - Whether to show scroll indicator
 * @param {object} style - Additional styles for the container
 * @param {object} contentContainerStyle - Additional styles for the scroll content container
 */
const ContentContainer = ({
  children,
  scrollable = true,
  showsVerticalScrollIndicator = false,
  style,
  contentContainerStyle
}) => {
  // If content should be scrollable
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.scrollView, style]}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        bounces={true}
      >
        {children}
      </ScrollView>
    );
  }
  
  // Otherwise render as a plain View
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: 16,
    paddingBottom: 32, // Extra padding at the bottom for better scrolling
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingVertical: 16,
  }
});

export default ContentContainer; 