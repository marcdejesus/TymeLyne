import React from 'react';
import SafeAreaContainer from './SafeAreaContainer';
import Header from './Header';
import ContentContainer from './ContentContainer';
import BottomNavigation from './BottomNavigation';
import { colors } from '../constants/theme';

/**
 * Standardized Screen component that combines all necessary layout components
 * This makes it easy to create consistent screens across the app
 * 
 * @param {node} children - Child components to render in the content area
 * @param {string} title - Title for the header
 * @param {function} onBackPress - Function for back button press
 * @param {function} onMenuPress - Function for menu button press
 * @param {function} onRightPress - Function for right button press
 * @param {string} rightIcon - Icon name for right button
 * @param {boolean} scrollable - Whether content should be scrollable
 * @param {boolean} showBottomNav - Whether to show bottom navigation (deprecated, use Tab.Navigator instead)
 * @param {string} backgroundColor - Background color for the screen
 * @param {boolean} statusBarLight - Whether to use light status bar content
 * @param {object} style - Additional styles for the content container
 * @param {object} contentContainerStyle - Additional styles for the scroll content container
 * @param {string} keyboardShouldPersistTaps - Keyboard persistence setting for scroll view
 * @param {object} scrollViewRef - Reference to the scroll view
 */
const Screen = ({
  children,
  title,
  onBackPress,
  onMenuPress,
  onRightPress,
  rightIcon,
  activeScreen,
  onHomePress,
  onAchievementsPress,
  onProfilePress,
  scrollable = true,
  showBottomNav = false,
  backgroundColor = colors.background,
  statusBarLight = false,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  scrollViewRef
}) => {
  return (
    <SafeAreaContainer 
      backgroundColor={backgroundColor}
      statusBarLight={statusBarLight}
    >
      {/* Header */}
      {(title || onBackPress || onMenuPress || onRightPress) && (
        <Header 
          title={title}
          onBackPress={onBackPress}
          onMenuPress={onMenuPress}
          onRightPress={onRightPress}
          rightIcon={rightIcon}
          backgroundColor={backgroundColor}
        />
      )}
      
      {/* Content */}
      <ContentContainer
        scrollable={scrollable}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        ref={scrollViewRef}
      >
        {children}
      </ContentContainer>
      
      {/* Bottom Navigation - only show if explicitly enabled
          This is kept for backward compatibility with screens
          that haven't been updated to use Tab.Navigator */}
      {showBottomNav && onHomePress && onAchievementsPress && onProfilePress && (
        <BottomNavigation 
          activeScreen={activeScreen}
          onHomePress={onHomePress}
          onAchievementsPress={onAchievementsPress}
          onProfilePress={onProfilePress}
        />
      )}
    </SafeAreaContainer>
  );
};

export default Screen; 