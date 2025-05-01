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
      case 'section-title':
        return { width: customWidth || '100%', height: customHeight || 30 };
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

  // Render a course card skeleton that matches CourseCard layout
  const renderCourseCardSkeleton = (key) => {
    return (
      <Animated.View
        key={`skeleton-course-${key}`}
        style={[
          styles.skeleton,
          styles.cardSkeleton,
          {
            borderRadius: getBorderRadius(),
            backgroundColor: colors.card,
            marginRight: spacing.m,
          }
        ]}
      >
        {/* Icon circle */}
        <Animated.View
          style={[
            styles.circleIcon,
            { backgroundColor: shimmerInterpolation }
          ]}
        />
        
        {/* Content area */}
        <View style={styles.contentArea}>
          {/* Title lines */}
          <Animated.View
            style={[
              styles.titleLine,
              { backgroundColor: shimmerInterpolation, width: '80%' }
            ]}
          />
          <Animated.View
            style={[
              styles.titleLine,
              { backgroundColor: shimmerInterpolation, width: '60%', marginTop: spacing.xs }
            ]}
          />
          
          {/* Progress text */}
          <Animated.View
            style={[
              styles.progressText,
              { backgroundColor: shimmerInterpolation, width: '40%', marginTop: spacing.s }
            ]}
          />
          
          {/* Progress bar */}
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: shimmerInterpolation, marginTop: spacing.xs }
            ]}
          />
        </View>
        
        {/* Options button */}
        <Animated.View
          style={[
            styles.optionsButton,
            { backgroundColor: shimmerInterpolation }
          ]}
        />
      </Animated.View>
    );
  };
  
  // Render a grid card skeleton that matches grid layout
  const renderGridCardSkeleton = (key) => {
    return (
      <Animated.View
        key={`skeleton-grid-${key}`}
        style={[
          styles.skeleton,
          styles.gridSkeleton,
          {
            borderRadius: getBorderRadius(),
            backgroundColor: colors.card,
            marginRight: key % 2 === 0 ? '4%' : 0,
            marginBottom: spacing.m,
          }
        ]}
      >
        {/* Icon circle */}
        <Animated.View
          style={[
            styles.gridCircleIcon,
            { backgroundColor: shimmerInterpolation }
          ]}
        />
        
        {/* Title lines */}
        <Animated.View
          style={[
            styles.gridTitleLine,
            { backgroundColor: shimmerInterpolation, width: '80%', marginTop: spacing.s }
          ]}
        />
        <Animated.View
          style={[
            styles.gridTitleLine,
            { backgroundColor: shimmerInterpolation, width: '60%', marginTop: spacing.xs }
          ]}
        />
      </Animated.View>
    );
  };
  
  // Render a section title skeleton
  const renderSectionTitleSkeleton = (key) => {
    return (
      <View 
        key={`skeleton-section-${key}`}
        style={[styles.sectionTitleContainer, { paddingHorizontal: spacing.m }]}
      >
        {/* Title */}
        <Animated.View
          style={[
            styles.sectionTitleLine,
            { backgroundColor: shimmerInterpolation, width: '60%' }
          ]}
        />
        
        {/* Right text (if applicable) */}
        <Animated.View
          style={[
            styles.sectionRightText,
            { backgroundColor: shimmerInterpolation }
          ]}
        />
      </View>
    );
  };
  
  // Create skeleton elements based on count
  const renderSkeletons = () => {
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      if (variant === 'course') {
        elements.push(renderCourseCardSkeleton(i));
      } else if (variant === 'grid') {
        elements.push(renderGridCardSkeleton(i));
      } else if (variant === 'section-title') {
        elements.push(renderSectionTitleSkeleton(i));
      } else {
        // Default text or simple skeleton
        const { width: itemWidth, height: itemHeight } = getDimensions();
        const itemRadius = getBorderRadius();
        
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
                marginBottom: spacing.s,
              }
            ]}
          />
        );
      }
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
      case 'section-title':
        return (
          <View style={[styles.container, style, { marginTop: spacing.m, marginBottom: spacing.s }]}>
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
  // Course card skeleton styles
  cardSkeleton: {
    flexDirection: 'row',
    padding: spacing.m,
    height: 100,
    alignItems: 'center',
  },
  circleIcon: {
    width: width * 0.15,
    height: width * 0.15,
    maxWidth: 60,
    maxHeight: 60,
    borderRadius: width * 0.075,
    marginRight: spacing.m,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    height: 12,
    borderRadius: 4,
  },
  progressText: {
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '95%',
  },
  optionsButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: spacing.s,
  },
  // Grid card skeleton styles
  gridSkeleton: {
    width: '48%',
    aspectRatio: 1,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCircleIcon: {
    width: width * 0.14,
    height: width * 0.14,
    maxWidth: 55,
    maxHeight: 55,
    borderRadius: width * 0.07,
  },
  gridTitleLine: {
    height: 10,
    borderRadius: 4,
  },
  // Section title skeleton styles
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
  },
  sectionTitleLine: {
    height: 16,
    borderRadius: 4,
  },
  sectionRightText: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
});

export default SkeletonLoader; 