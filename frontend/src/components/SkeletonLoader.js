import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * SkeletonLoader component that provides animated placeholder UI while content is loading
 * 
 * @param {object} style - Additional styles for the skeleton container
 * @param {string} variant - Skeleton variant ('course', 'grid', 'card', 'text')
 * @param {number} width - Custom width for the skeleton
 * @param {number} height - Custom height for the skeleton
 * @param {number} count - Number of skeleton items to display (for arrays)
 */
const SkeletonLoader = ({ 
  style, 
  variant = 'text', 
  width: customWidth, 
  height: customHeight,
  count = 1,
  borderRadius: customRadius
}) => {
  // Animation value for the shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Start the shimmer animation when component mounts
  useEffect(() => {
    // Create a looping animation
    const loopShimmerAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false, // We need to animate background colors
        })
      ).start();
    };
    
    loopShimmerAnimation();
    
    // Clean up animation on unmount
    return () => {
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim]);
  
  // Interpolate animation value to create shimmer effect
  const shimmerInterpolation = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.15)']
  });
  
  // Get dimensions based on variant
  const getDimensions = () => {
    switch (variant) {
      case 'course':
        return { width: customWidth || 420, height: customHeight || 100 };
      case 'grid':
        return { width: customWidth || width * 0.44, height: customHeight || 150 };
      case 'card':
        return { width: customWidth || '100%', height: customHeight || 100 };
      case 'text':
      default:
        return { width: customWidth || '100%', height: customHeight || 20 };
    }
  };
  
  // Get border radius based on variant
  const getBorderRadius = () => {
    if (customRadius) return customRadius;
    
    switch (variant) {
      case 'course':
      case 'card':
        return borderRadius.m;
      case 'grid':
        return borderRadius.s;
      default:
        return borderRadius.s;
    }
  };
  
  // Create skeleton elements based on count
  const renderSkeletons = () => {
    const elements = [];
    const { width: itemWidth, height: itemHeight } = getDimensions();
    const itemRadius = getBorderRadius();
    
    for (let i = 0; i < count; i++) {
      elements.push(
        <Animated.View
          key={`skeleton-${i}`}
          style={[
            styles.skeleton,
            {
              width: itemWidth,
              height: itemHeight,
              borderRadius: itemRadius,
              backgroundColor: shimmerInterpolation,
              marginRight: variant === 'course' ? spacing.m : 0,
              marginBottom: variant === 'grid' ? spacing.m : spacing.s,
            },
            i % 2 === 0 && variant === 'grid' && { marginRight: '4%' }
          ]}
        />
      );
    }
    
    return elements;
  };
  
  // Render container based on variant
  const renderContainer = () => {
    switch (variant) {
      case 'course':
        return (
          <View style={[styles.horizontalContainer, style]}>
            {renderSkeletons()}
          </View>
        );
      case 'grid':
        return (
          <View style={[styles.gridContainer, style]}>
            {renderSkeletons()}
          </View>
        );
      default:
        return (
          <View style={[styles.container, style]}>
            {renderSkeletons()}
          </View>
        );
    }
  };
  
  return renderContainer();
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  horizontalContainer: {
    flexDirection: 'row',
    paddingBottom: spacing.s,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: spacing.m,
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.s,
  },
});

export default SkeletonLoader; 