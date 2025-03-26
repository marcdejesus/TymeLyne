import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Title, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
}

interface ProfileThemeSelectorProps {
  selectedThemeId: string;
  onThemeChange: (themeId: string) => void;
}

const themes: ThemeOption[] = [
  {
    id: 'purple',
    name: 'Purple Haze',
    primaryColor: '#6200ee',
    secondaryColor: '#9c27b0',
    icon: 'zap',
  },
  {
    id: 'blue',
    name: 'Deep Ocean',
    primaryColor: '#1976d2',
    secondaryColor: '#0d47a1',
    icon: 'droplet',
  },
  {
    id: 'green',
    name: 'Emerald',
    primaryColor: '#43a047',
    secondaryColor: '#2e7d32',
    icon: 'leaf',
  },
  {
    id: 'orange',
    name: 'Sunset',
    primaryColor: '#fb8c00',
    secondaryColor: '#ef6c00',
    icon: 'sun',
  },
  {
    id: 'pink',
    name: 'Rose Gold',
    primaryColor: '#ec407a',
    secondaryColor: '#d81b60',
    icon: 'heart',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    primaryColor: '#424242',
    secondaryColor: '#212121',
    icon: 'moon',
  },
];

const ProfileThemeSelector = ({ selectedThemeId, onThemeChange }: ProfileThemeSelectorProps) => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Theme Customization</Title>
      <Divider style={styles.divider} />
      
      <View style={styles.themesContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeOption,
              selectedThemeId === theme.id && styles.selectedTheme,
              { backgroundColor: theme.primaryColor }
            ]}
            onPress={() => onThemeChange(theme.id)}
          >
            <View style={styles.themeContent}>
              <Icon name={theme.icon} size={24} color="white" />
              <Text style={styles.themeName}>{theme.name}</Text>
              {selectedThemeId === theme.id && (
                <View style={styles.checkmark}>
                  <Icon name="check" size={16} color="white" />
                </View>
              )}
            </View>
            <View 
              style={[
                styles.themeColorPreview, 
                { backgroundColor: theme.secondaryColor }
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeOption: {
    width: '48%',
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  themeContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  themeName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  themeColorPreview: {
    height: 20,
    width: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileThemeSelector; 