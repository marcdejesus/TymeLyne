import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * A wrapper component that provides safe area insets and keyboard avoiding behavior
 * Use this as the root container for all screens to ensure consistent layout
 */
const SafeAreaContainer = ({ 
  children, 
  style, 
  scrollable = false, 
  keyboardAvoiding = false,
  backgroundColor = '#FFFFFF'
}) => {
  // Base container with safe area
  const Container = ({ children }) => (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );

  // If scrollable is true, wrap children in a ScrollView
  if (scrollable) {
    return (
      <Container>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default SafeAreaContainer; 