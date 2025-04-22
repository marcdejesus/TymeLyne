import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const isIphoneWithNotch = Platform.OS === 'ios' && height > 800;

/**
 * Reusable component for containing the main content of a screen
 * with consistent padding and scrolling behavior
 * 
 * @param {node} children - Child components to render inside the container
 * @param {boolean} scrollable - Whether content should be scrollable
 * @param {boolean} showsVerticalScrollIndicator - Whether to show scroll indicator
 * @param {boolean} keyboardAvoiding - Whether to add keyboard avoiding behavior
 * @param {object} style - Additional styles for the container
 * @param {object} contentContainerStyle - Additional styles for the scroll content container
 */
const ContentContainer = ({
  children,
  scrollable = true,
  showsVerticalScrollIndicator = false,
  keyboardAvoiding = false,
  style,
  contentContainerStyle
}) => {
  // Base content with appropriate padding
  const Content = ({ children, containerStyle }) => (
    <View style={[styles.container, containerStyle]}>
      {children}
    </View>
  );
  
  // If content needs keyboard avoiding behavior
  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (isIphoneWithNotch ? 40 : 20) : 0}
      >
        {scrollable ? (
          <ScrollView
            style={[styles.scrollView, style]}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            <Content>{children}</Content>
          </ScrollView>
        ) : (
          <Content containerStyle={style}>{children}</Content>
        )}
      </KeyboardAvoidingView>
    );
  }
  
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    paddingBottom: isIphoneWithNotch ? 40 : 32, // Extra padding at the bottom for better scrolling on notched devices
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
  }
});

export default ContentContainer; 