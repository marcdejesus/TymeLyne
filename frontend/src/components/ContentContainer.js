import React, { forwardRef, memo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

/**
 * ContentContainer component that wraps content in a scrollable or static container
 * 
 * @param {ReactNode} children - Content to display
 * @param {boolean} scrollable - Whether content should be scrollable
 * @param {object} style - Additional style for the container
 * @param {object} contentContainerStyle - Style for the scroll view content container
 * @param {boolean} showsVerticalScrollIndicator - Whether to show scroll indicator
 * @param {boolean} keyboardShouldPersistTaps - How keyboard should behave when tapping outside of keyboard
 * @param {object} props - Additional props to pass to ScrollView/View
 */
const ContentContainer = memo(forwardRef(({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'always',
  ...props
}, ref) => {
  // Create containerStyle only when style changes
  const containerStyle = React.useMemo(() => {
    return [styles.container, style];
  }, [style]);
  
  // Create contentStyle only when contentContainerStyle changes
  const contentStyle = React.useMemo(() => {
    return [styles.contentContainer, contentContainerStyle];
  }, [contentContainerStyle]);
  
  if (scrollable) {
    return (
      <ScrollView
        ref={ref}
        style={containerStyle}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        removeClippedSubviews={true}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  }
});

ContentContainer.displayName = 'ContentContainer';

export default ContentContainer; 