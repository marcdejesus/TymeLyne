import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Searchbar, Chip, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Achievement } from './AchievementBadges';
import AppHeader from '../layout/AppHeader';
import { mockAchievements } from './mockAchievements';
import { useAuth } from '../../hooks/useAuth';

type FilterType = 'all' | 'unlocked' | 'locked';
type SortType = 'recent' | 'oldest' | 'rarity';

const AchievementsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  
  // Load achievements on component mount
  useEffect(() => {
    // In a real app, this would fetch from your API
    setAchievements(mockAchievements);
  }, []);
  
  // Filter and sort achievements based on current settings
  const getFilteredAchievements = () => {
    let filtered = [...achievements];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a => a.title.toLowerCase().includes(query) || 
             a.description.toLowerCase().includes(query)
      );
    }
    
    // Apply unlock status filter
    if (filter === 'unlocked') {
      filtered = filtered.filter(a => a.dateUnlocked !== null);
    } else if (filter === 'locked') {
      filtered = filtered.filter(a => a.dateUnlocked === null);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        // Sort by unlock date (recent first)
        if (!a.dateUnlocked) return 1;
        if (!b.dateUnlocked) return -1;
        return new Date(b.dateUnlocked).getTime() - new Date(a.dateUnlocked).getTime();
      } else if (sortBy === 'oldest') {
        // Sort by unlock date (oldest first)
        if (!a.dateUnlocked) return 1;
        if (!b.dateUnlocked) return -1;
        return new Date(a.dateUnlocked).getTime() - new Date(b.dateUnlocked).getTime();
      } else {
        // Sort by rarity (highest first)
        const rarityScore = {
          'legendary': 4,
          'epic': 3,
          'rare': 2,
          'common': 1
        };
        return rarityScore[b.rarity] - rarityScore[a.rarity];
      }
    });
    
    return filtered;
  };
  
  // Get background color based on rarity
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return '#78909c';
      case 'rare': return '#5c6bc0';
      case 'epic': return '#8e24aa';
      case 'legendary': return '#ff6f00';
      default: return '#78909c';
    }
  };
  
  // Render individual achievement card
  const renderAchievement = ({ item }: { item: Achievement }) => {
    const isUnlocked = item.dateUnlocked !== null;
    const rarityColor = getRarityColor(item.rarity);
    
    return (
      <Card 
        style={[
          styles.achievementCard, 
          { 
            backgroundColor: theme.cardColor,
            borderLeftColor: rarityColor,
            opacity: isUnlocked ? 1 : 0.7
          }
        ]}
      >
        <Card.Content style={styles.achievementContent}>
          <View style={[styles.iconContainer, { backgroundColor: rarityColor }]}>
            <Icon 
              name={item.icon} 
              size={28} 
              color="white" 
            />
          </View>
          
          <View style={styles.achievementDetails}>
            <View style={styles.achievementHeader}>
              <Text style={[styles.achievementTitle, { color: theme.textColor }]}>
                {item.title}
              </Text>
              <Chip 
                style={[styles.rarityChip, { backgroundColor: rarityColor }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {item.rarity.toUpperCase()}
              </Chip>
            </View>
            
            <Text style={[styles.achievementDescription, { color: `${theme.textColor}99` }]}>
              {item.description}
            </Text>
            
            {isUnlocked ? (
              <Text style={[styles.achievementDate, { color: theme.accentColor }]}>
                Unlocked on {new Date(item.dateUnlocked!).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={[styles.achievementLocked, { color: `${theme.textColor}70` }]}>
                Locked - Complete requirements to unlock
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Render empty state when no achievements match filters
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="award" size={60} color={`${theme.textColor}50`} />
      <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
        No achievements found
      </Text>
      <Text style={[styles.emptySubtitle, { color: `${theme.textColor}80` }]}>
        Try changing your search or filter settings
      </Text>
      <Button 
        mode="contained" 
        onPress={() => {
          setSearchQuery('');
          setFilter('all');
          setSortBy('recent');
        }}
        style={[styles.resetButton, { backgroundColor: theme.primaryColor }]}
      >
        Reset Filters
      </Button>
    </View>
  );
  
  const filteredAchievements = getFilteredAchievements();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <AppHeader 
        title="Achievements" 
        showBackButton 
        onBackPress={() => navigation.goBack()}
        username={profile?.full_name || 'User'}
        avatarUrl={profile?.avatar_url || undefined}
        userRole={profile?.role || 'USER'}
      />
      
      <View style={styles.content}>
        <Searchbar
          placeholder="Search achievements"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.cardColor }]}
          inputStyle={{ color: theme.textColor }}
          iconColor={theme.primaryColor}
          placeholderTextColor={`${theme.textColor}70`}
        />
        
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={[
                styles.filterChip,
                { backgroundColor: filter === 'all' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: filter === 'all' ? 'white' : theme.textColor 
              }}
            >
              All
            </Chip>
            
            <Chip
              selected={filter === 'unlocked'}
              onPress={() => setFilter('unlocked')}
              style={[
                styles.filterChip,
                { backgroundColor: filter === 'unlocked' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: filter === 'unlocked' ? 'white' : theme.textColor 
              }}
              icon="check-circle"
            >
              Unlocked
            </Chip>
            
            <Chip
              selected={filter === 'locked'}
              onPress={() => setFilter('locked')}
              style={[
                styles.filterChip,
                { backgroundColor: filter === 'locked' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: filter === 'locked' ? 'white' : theme.textColor 
              }}
              icon="lock"
            >
              Locked
            </Chip>
            
            <Divider style={styles.filterDivider} />
            
            <Chip
              selected={sortBy === 'recent'}
              onPress={() => setSortBy('recent')}
              style={[
                styles.filterChip,
                { backgroundColor: sortBy === 'recent' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: sortBy === 'recent' ? 'white' : theme.textColor 
              }}
              icon="clock"
            >
              Recent First
            </Chip>
            
            <Chip
              selected={sortBy === 'oldest'}
              onPress={() => setSortBy('oldest')}
              style={[
                styles.filterChip,
                { backgroundColor: sortBy === 'oldest' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: sortBy === 'oldest' ? 'white' : theme.textColor 
              }}
              icon="calendar"
            >
              Oldest First
            </Chip>
            
            <Chip
              selected={sortBy === 'rarity'}
              onPress={() => setSortBy('rarity')}
              style={[
                styles.filterChip,
                { backgroundColor: sortBy === 'rarity' ? theme.primaryColor : theme.cardColor }
              ]}
              textStyle={{ 
                color: sortBy === 'rarity' ? 'white' : theme.textColor 
              }}
              icon="star"
            >
              Rarity
            </Chip>
          </ScrollView>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statValue, { color: theme.primaryColor }]}>
              {achievements.filter(a => a.dateUnlocked !== null).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textColor }]}>
              Unlocked
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statValue, { color: theme.primaryColor }]}>
              {achievements.filter(a => a.dateUnlocked === null).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textColor }]}>
              Locked
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statValue, { color: theme.primaryColor }]}>
              {Math.round((achievements.filter(a => a.dateUnlocked !== null).length / achievements.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textColor }]}>
              Completed
            </Text>
          </View>
        </View>
        
        <FlatList
          data={filteredAchievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.achievementsList}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  filterDivider: {
    height: '100%',
    width: 1,
    marginHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementsList: {
    paddingBottom: 20,
  },
  achievementCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  rarityChip: {
    height: 20,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  achievementDate: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementLocked: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 8,
  }
});

export default AchievementsScreen; 