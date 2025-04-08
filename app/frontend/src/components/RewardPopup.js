import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * RewardPopup - Shows an animated popup when user earns rewards
 * @param {Object} reward - Object containing xp and coins earned
 * @param {boolean} visible - Whether the popup should be visible
 * @param {Function} onAnimationComplete - Callback when animation finishes
 */
const RewardPopup = ({ reward, visible, onAnimationComplete }) => {
  // Get accent color from theme context
  const { accent } = useTheme();

  // Animation values
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible && reward) {
      // Reset animation values
      translateY.setValue(100);
      opacity.setValue(0);
      scale.setValue(0.5);

      // Animation sequence
      Animated.sequence([
        // 1. Fade in and slide up
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        
        // 2. Hold visible for a moment
        Animated.delay(1500),
        
        // 3. Fade out and slide up more
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Call the onAnimationComplete callback
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [visible, reward, onAnimationComplete]);

  // Don't render anything if not visible or no reward
  if (!visible || !reward) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.popup,
          {
            opacity,
            transform: [
              { translateY },
              { scale }
            ],
            borderColor: accent,
          }
        ]}
      >
        <Text style={styles.title}>Reward!</Text>
        
        <View style={styles.rewards}>
          {reward.xp > 0 && (
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.rewardText}>+{reward.xp} XP</Text>
            </View>
          )}
          
          {reward.coins > 0 && (
            <View style={styles.rewardItem}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
              <Text style={styles.rewardText}>+{reward.coins} coins</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none', // Allow clicks to pass through
  },
  popup: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rewards: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  rewardText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RewardPopup; 