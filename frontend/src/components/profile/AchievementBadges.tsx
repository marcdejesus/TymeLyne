import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Card, Button, Title, Paragraph, Modal, Portal, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// Mock achievement data - in a real app this would come from your API
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked: string | null;
  selected: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgesProps {
  userId: string;
  selectedAchievements?: Achievement[];
  onAchievementsSelected?: (achievements: Achievement[]) => void;
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Goal',
    description: 'Created your first goal in TymeLyne',
    icon: 'target',
    dateUnlocked: '2023-04-15',
    selected: true,
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Streak Master',
    description: 'Maintained a 7-day streak',
    icon: 'zap',
    dateUnlocked: '2023-05-02',
    selected: true,
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Task Tactician',
    description: 'Completed 50 tasks',
    icon: 'check-square',
    dateUnlocked: '2023-05-18',
    selected: true,
    rarity: 'epic'
  },
  {
    id: '4',
    title: 'Goal Crusher',
    description: 'Completed 10 goals',
    icon: 'trophy',
    dateUnlocked: '2023-06-10',
    selected: false,
    rarity: 'epic'
  },
  {
    id: '5',
    title: 'Planning Pro',
    description: 'Created a goal with all details filled in',
    icon: 'clipboard',
    dateUnlocked: '2023-04-18',
    selected: false,
    rarity: 'common'
  },
  {
    id: '6',
    title: 'Early Bird',
    description: 'Completed 5 tasks before 9 AM',
    icon: 'sunrise',
    dateUnlocked: '2023-05-25',
    selected: false,
    rarity: 'rare'
  },
  {
    id: '7',
    title: 'Night Owl',
    description: 'Completed 5 tasks after 10 PM',
    icon: 'moon',
    dateUnlocked: '2023-06-05',
    selected: false,
    rarity: 'rare'
  },
  {
    id: '8',
    title: 'Consistency King',
    description: 'Maintained a 30-day streak',
    icon: 'crown',
    dateUnlocked: null,
    selected: false,
    rarity: 'legendary'
  }
];

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  userId, 
  selectedAchievements = mockAchievements.filter(a => a.selected),
  onAchievementsSelected
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [tempSelected, setTempSelected] = useState<Achievement[]>(selectedAchievements);

  // Get the background color based on rarity
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return '#78909c';
      case 'rare': return '#5c6bc0';
      case 'epic': return '#8e24aa';
      case 'legendary': return '#ff6f00';
      default: return '#78909c';
    }
  };

  // Handle achievement selection
  const toggleSelection = (id: string) => {
    if (tempSelected.length >= 3 && !tempSelected.find(a => a.id === id)) {
      // If already 3 selected and trying to select a new one
      return;
    }

    setTempSelected(prev => {
      const isCurrentlySelected = prev.some(a => a.id === id);
      
      if (isCurrentlySelected) {
        // Remove from selection
        return prev.filter(a => a.id === id ? false : true);
      } else {
        // Add to selection if less than 3
        const achievementToAdd = achievements.find(a => a.id === id);
        if (achievementToAdd && prev.length < 3) {
          return [...prev, achievementToAdd];
        }
      }
      return prev;
    });
  };

  // Save the selection
  const saveSelection = () => {
    // Update the achievements with the new selection
    const updatedAchievements = achievements.map(a => ({
      ...a,
      selected: tempSelected.some(s => s.id === a.id)
    }));
    
    setAchievements(updatedAchievements);
    
    // Call the parent callback if provided
    if (onAchievementsSelected) {
      onAchievementsSelected(tempSelected);
    }
    
    setModalVisible(false);
  };

  // Reset selection to the current state
  const cancelSelection = () => {
    setTempSelected(achievements.filter(a => a.selected));
    setModalVisible(false);
  };

  // Render the achievement card
  const renderAchievement = ({ item }: { item: Achievement }) => {
    const isSelected = tempSelected.some(a => a.id === item.id);
    const rarityColor = getRarityColor(item.rarity);
    
    return (
      <TouchableOpacity 
        style={[
          styles.achievementItem, 
          {
            backgroundColor: isSelected 
              ? `${rarityColor}` 
              : theme.cardColor,
            borderColor: rarityColor,
          }
        ]}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={styles.achievementContent}>
          <View style={[styles.iconContainer, { backgroundColor: rarityColor }]}>
            <Icon name={item.icon} size={24} color="white" />
          </View>
          
          <View style={styles.achievementTextContainer}>
            <Text style={[
              styles.achievementTitle, 
              { color: isSelected ? 'white' : theme.textColor }
            ]}>
              {item.title}
            </Text>
            
            <Text style={[
              styles.achievementDescription,
              { color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }
            ]}>
              {item.description}
            </Text>
            
            <Chip 
              style={[styles.rarityChip, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : rarityColor }]} 
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.rarity.toUpperCase()}
            </Chip>
          </View>
          
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Icon name="check-circle" size={24} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={[styles.container, { backgroundColor: theme.cardColor }]}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Title style={[styles.title, { color: theme.textColor }]}>Achievements</Title>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
            <Icon name="edit-2" size={14} color="white" style={styles.editIcon} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.badgesContainer}>
          {selectedAchievements.length > 0 ? (
            selectedAchievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.badge, 
                  { backgroundColor: getRarityColor(achievement.rarity) }
                ]}
              >
                <Icon name={achievement.icon} size={30} color="white" />
                <Text style={styles.badgeTitle}>{achievement.title}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noBadgesContainer}>
              <Icon name="trophy" size={40} color={theme.primaryColor} style={styles.noBadgesIcon} />
              <Paragraph style={styles.noBadgesText}>
                No achievements selected. Tap Edit to choose which achievements to display.
              </Paragraph>
            </View>
          )}
        </View>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('Achievements' as never)}
          style={[styles.viewAllButton, { borderColor: theme.primaryColor }]}
          labelStyle={{ color: theme.primaryColor }}
        >
          View All Achievements
        </Button>
      </Card.Content>
      
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={cancelSelection}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.backgroundColor }]}
        >
          <View style={styles.modalHeader}>
            <Title style={[styles.modalTitle, { color: theme.textColor }]}>
              Select Displayed Achievements
            </Title>
            <Text style={[styles.modalSubtitle, { color: theme.textColor }]}>
              Choose up to 3 achievements to display on your profile
            </Text>
          </View>
          
          <FlatList
            data={achievements}
            renderItem={renderAchievement}
            keyExtractor={(item) => item.id}
            style={styles.achievementsList}
            contentContainerStyle={styles.achievementsListContent}
          />
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={cancelSelection}
              style={[styles.cancelButton, { borderColor: '#999' }]}
              labelStyle={{ color: '#999' }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={saveSelection}
              style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
              labelStyle={{ color: 'white' }}
            >
              Save Selection
            </Button>
          </View>
        </Modal>
      </Portal>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  editIcon: {
    marginLeft: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  badge: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  noBadgesContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBadgesIcon: {
    marginBottom: 12,
  },
  noBadgesText: {
    textAlign: 'center',
    color: '#888',
  },
  viewAllButton: {
    marginTop: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  achievementsList: {
    flex: 1,
  },
  achievementsListContent: {
    paddingVertical: 8,
  },
  achievementItem: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  achievementContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 12,
    marginVertical: 4,
  },
  rarityChip: {
    height: 20,
    alignSelf: 'flex-start',
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 12,
  },
  saveButton: {
    minWidth: 120,
  },
});

export default AchievementBadges; 