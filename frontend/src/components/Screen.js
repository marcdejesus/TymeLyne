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
 * @param {string} activeScreen - Active screen for bottom navigation
 * @param {function} onHomePress - Function for home tab press
 * @param {function} onAchievementsPress - Function for leaderboards tab press
 * @param {function} onProfilePress - Function for profile tab press
 * @param {boolean} scrollable - Whether content should be scrollable
 * @param {boolean} showBottomNav - Whether to show bottom navigation
 * @param {string} backgroundColor - Background color for the screen
 * @param {boolean} statusBarLight - Whether to use light status bar content
 * @param {object} style - Additional styles for the content container
 * @param {object} contentContainerStyle - Additional styles for the scroll content container
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
  showBottomNav = true,
  backgroundColor = colors.background,
  statusBarLight = false,
  style,
  contentContainerStyle
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
      >
        {children}
      </ContentContainer>
      
      {/* Bottom Navigation */}
      {showBottomNav && (
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