import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Accent color options
const accentColors = [
  { name: 'Orange', value: '#E67E22' }, // Default
  { name: 'Blue', value: '#3498db' },
  { name: 'Green', value: '#2ecc71' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Teal', value: '#1abc9c' },
];

/**
 * SettingsScreen - Allows users to manage app settings
 */
const SettingsScreen = () => {
  const { user } = useAuth();
  const { accent, changeAccentColor } = useTheme();
  
  // Subscription status (demo)
  const [isPro, setIsPro] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: true, // Always true in this app
    saveData: false,
  });
  
  // Handle settings toggle
  const handleToggleSetting = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };
  
  // Handle change accent color
  const handleChangeAccentColor = (color) => {
    changeAccentColor(color);
  };
  
  // Handle manage subscription
  const handleManageSubscription = () => {
    if (isPro) {
      Alert.alert(
        'Manage Subscription',
        'You are currently subscribed to Pro. Would you like to cancel?',
        [
          {
            text: 'Cancel Subscription',
            onPress: () => {
              // In a real app, this would handle cancellation
              setIsPro(false);
              Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.');
            },
            style: 'destructive',
          },
          {
            text: 'Keep Subscription',
            style: 'cancel',
          },
        ]
      );
    } else {
      Alert.alert(
        'Upgrade to Pro',
        'Upgrade to Pro for $8.99/month to unlock unlimited energy, AI courses, and more!',
        [
          {
            text: 'Subscribe',
            onPress: () => {
              // In a real app, this would handle subscription
              setIsPro(true);
              Alert.alert('Subscription Successful', 'You are now a Pro subscriber!');
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };
  
  // Render accent color option
  const renderAccentOption = (color) => (
    <TouchableOpacity
      key={color.value}
      style={[styles.colorOption, { backgroundColor: color.value }]}
      onPress={() => handleChangeAccentColor(color.value)}
    >
      {color.value === accent && (
        <Ionicons name="checkmark" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.profileName}>{user?.name || 'Full Name'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
                <Text style={styles.subscriptionStatus}>
                  {isPro ? 'Pro Subscriber' : 'Free Plan'}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: accent }]}
            onPress={handleManageSubscription}
          >
            <Text style={styles.settingButtonText}>
              {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications for updates
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#333', true: accent }}
              thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#333"
              onValueChange={() => handleToggleSetting('notifications')}
              value={settings.notifications}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for achievements and alerts
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#333', true: accent }}
              thumbColor={settings.soundEffects ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#333"
              onValueChange={() => handleToggleSetting('soundEffects')}
              value={settings.soundEffects}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Data Saver</Text>
              <Text style={styles.settingDescription}>
                Reduce data usage by loading lower quality images
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#333', true: accent }}
              thumbColor={settings.saveData ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#333"
              onValueChange={() => handleToggleSetting('saveData')}
              value={settings.saveData}
            />
          </View>
        </View>
        
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          
          <Text style={styles.themeLabel}>Accent Color</Text>
          <View style={styles.colorsContainer}>
            {accentColors.map(renderAccentOption)}
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDDDDD',
    marginRight: 15,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#999',
    fontSize: 14,
  },
  subscriptionStatus: {
    color: '#E67E22',
    fontSize: 14,
    marginTop: 5,
    fontWeight: 'bold',
  },
  settingButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
    width: 250,
  },
  themeLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SettingsScreen; 