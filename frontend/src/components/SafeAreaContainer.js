import React from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const { height } = Dimensions.get('window');
const isIphoneWithNotch = Platform.OS === 'ios' && height > 800;

/**
 * A wrapper component that provides safe area insets and keyboard avoiding behavior
 * Use this as the root container for all screens to ensure consistent layout on all devices
 * including those with notches and home indicators
 * 
 * @param {React.ReactNode} children - Content to be rendered inside the container
 * @param {Object} style - Additional styles for the container
 * @param {boolean} scrollable - Whether the content should be scrollable
 * @param {boolean} keyboardAvoiding - Whether to enable keyboard avoiding behavior
 * @param {string} backgroundColor - Background color of the container
 * @param {boolean} statusBarLight - Whether to use light content for status bar (for dark backgrounds)
 */
const SafeAreaContainer = ({ 
  children, 
  style, 
  scrollable = false, 
  keyboardAvoiding = false,
  backgroundColor = colors.background,
  statusBarLight = false
}) => {
  // Base container with safe area
  const Container = ({ children }) => (
    <>
      <StatusBar 
        barStyle={statusBarLight ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView 
        style={[styles.container, { backgroundColor }, style]}
        edges={['top', 'left', 'right']}
      >
        {children}
      </SafeAreaView>
    </>
  );

  // If scrollable is true, wrap children in a ScrollView
  if (scrollable) {
    return (
      <Container>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
        >
          {children}
        </ScrollView>
      </Container>
    );
  }

  // If keyboardAvoiding is true, wrap children in a KeyboardAvoidingView
  if (keyboardAvoiding) {
    return (
      <Container>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? (isIphoneWithNotch ? 40 : 20) : 0}
        >
          {children}
        </KeyboardAvoidingView>
      </Container>
    );
  }

  // Default case: just render children within the SafeAreaView
  return <Container>{children}</Container>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isIphoneWithNotch ? 20 : 0, // Extra padding for notched devices
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default SafeAreaContainer; 