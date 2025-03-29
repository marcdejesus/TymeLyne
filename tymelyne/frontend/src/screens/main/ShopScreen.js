import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

/**
 * Shop Screen - Displays available items, badges, and subscription options
 */
const ShopScreen = () => {
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Mock user data instead of using Auth context
  const user = {
    name: 'John Doe',
    username: 'johndoe',
    coins: 350,
    xp: 500,
    level: 5
  };
  
  const [activeTab, setActiveTab] = useState('event');
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef(null);
  
  // Handle tab change
  const changeTab = (tab) => {
    setActiveTab(tab);
    if (scrollViewRef.current) {
      const index = tab === 'event' ? 0 : tab === 'weekly' ? 1 : 2;
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };
  
  // Handle scroll end to update active tab
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index === 0) setActiveTab('event');
    else if (index === 1) setActiveTab('weekly');
    else setActiveTab('pro');
  };
  
  // Generate dot indicators for pagination
  const renderDotIndicators = () => {
    const dotPositions = ['event', 'weekly', 'pro'];
    return (
      <View style={styles.dotsContainer}>
        {dotPositions.map((position, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scaleX = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={position}
              style={[
                styles.dot,
                {
                  transform: [{ scaleX }],
                  opacity,
                  backgroundColor: activeTab === position ? accentColor : '#666',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  // Demo items for the shop
  const eventItems = [
    { id: 'e1', name: 'Launch Badge', price: 200, image: null },
    { id: 'e2', name: '2X Coin Booster', price: 150, image: null },
    { id: 'e3', name: 'Limited Edition Avatar', price: 500, image: null },
  ];
  
  const weeklyItems = [
    { id: 'w1', name: 'Speedster Badge', price: 100, image: null },
    { id: 'w2', name: 'Neon Theme', price: 300, image: null },
    { id: 'w3', name: 'XP Booster', price: 200, image: null },
    { id: 'w4', name: 'Profile Banner', price: 250, image: null },
  ];
  
  // Render an item card
  const renderItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard}
      onPress={() => console.log(`Buy item: ${item.name}`)}
    >
      <View style={styles.itemImageContainer}>
        <View style={styles.badgeCircle}>
          <Ionicons name="star" size={28} color="#fff" />
        </View>
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Ionicons name="logo-bitcoin" size={16} color={accentColor} />
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>BUY</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  // Render camo design
  const renderCamoBackground = () => {
    return (
      <View style={styles.camoContainer}>
        <View style={[styles.camoSpot, { top: 50, left: 50, transform: [{ rotate: '25deg' }] }]} />
        <View style={[styles.camoSpot, { top: 120, left: 200, transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.camoSpot, { top: 220, left: 70, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.camoSpot, { top: 300, left: 220, transform: [{ rotate: '5deg' }] }]} />
        <View style={[styles.camoSpot, { top: 400, left: 100, transform: [{ rotate: '-30deg' }] }]} />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Coins display */}
      <View style={styles.coinsContainer}>
        <Ionicons name="logo-bitcoin" size={24} color={accentColor} />
        <Text style={styles.coinsText}>{user.coins}</Text>
      </View>
      
      {/* Tab selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'event' && styles.activeTab]}
          onPress={() => changeTab('event')}
        >
          <Text style={[styles.tabText, activeTab === 'event' && styles.activeTabText]}>Event Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => changeTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pro' && styles.activeTab]}
          onPress={() => changeTab('pro')}
        >
          <Text style={[styles.tabText, activeTab === 'pro' && styles.activeTabText]}>Pro</Text>
        </TouchableOpacity>
      </View>
      
      {/* Dot indicators */}
      {renderDotIndicators()}
      
      {/* Shop content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollViewHorizontal}
      >
        {/* Event Shop */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.itemsContainer}
        >
          <Text style={styles.shopTitle}>Event: Launch Celebration</Text>
          <Text style={styles.shopSubtitle}>Limited time offers to commemorate our launch!</Text>
          
          {eventItems.map(item => renderItem(item))}
        </ScrollView>
        
        {/* Weekly Shop */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.itemsContainer}
        >
          <Text style={styles.shopTitle}>Weekly Shop</Text>
          <Text style={styles.shopSubtitle}>Refreshes every Monday</Text>
          
          {weeklyItems.map(item => renderItem(item))}
        </ScrollView>
        
        {/* Pro Subscription */}
        <ScrollView 
          style={[styles.tabContent, { width }]}
          contentContainerStyle={styles.proContainer}
        >
          {renderCamoBackground()}
          
          <View style={styles.proContent}>
            <Text style={styles.proTitle}>GO PRO</Text>
            <Text style={styles.proSubtitle}>Unlock exclusive content and bonuses</Text>
            
            <View style={styles.proFeaturesContainer}>
              <View style={styles.proFeature}>
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                <Text style={styles.proFeatureText}>Exclusive Pro Badges</Text>
              </View>
              
              <View style={styles.proFeature}>
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                <Text style={styles.proFeatureText}>2X XP on all activities</Text>
              </View>
              
              <View style={styles.proFeature}>
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                <Text style={styles.proFeatureText}>Exclusive learning paths</Text>
              </View>
              
              <View style={styles.proFeature}>
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                <Text style={styles.proFeatureText}>Ad-free experience</Text>
              </View>
              
              <View style={styles.proFeature}>
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                <Text style={styles.proFeatureText}>OG Status Badge</Text>
              </View>
              
              <TouchableOpacity style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>SUBSCRIBE - $4.99/month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.annualButton}>
                <Text style={styles.annualButtonText}>ANNUAL - $49.99 (save 16%)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 20,
  },
  coinsText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DEFAULT_ACCENT_COLOR,
  },
  tabText: {
    color: '#999',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: DEFAULT_ACCENT_COLOR,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dot: {
    height: 8,
    width: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  scrollViewHorizontal: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  itemsContainer: {
    padding: 20,
  },
  shopTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  shopSubtitle: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemPrice: {
    color: '#fff',
    marginLeft: 5,
  },
  buyButton: {
    backgroundColor: DEFAULT_ACCENT_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  proContainer: {
    flex: 1,
    padding: 0,
  },
  camoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  camoSpot: {
    position: 'absolute',
    width: 100,
    height: 60,
    backgroundColor: DEFAULT_ACCENT_COLOR,
    borderRadius: 30,
  },
  proContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  proTitle: {
    color: DEFAULT_ACCENT_COLOR,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proSubtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  proFeaturesContainer: {
    width: '100%',
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  proFeatureText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  subscribeButton: {
    backgroundColor: DEFAULT_ACCENT_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  subscribeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  annualButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: DEFAULT_ACCENT_COLOR,
  },
  annualButtonText: {
    color: DEFAULT_ACCENT_COLOR,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ShopScreen; 