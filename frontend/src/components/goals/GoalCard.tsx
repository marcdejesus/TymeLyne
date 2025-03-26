import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card, IconButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 to 1
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  tags?: string[];
}

interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onReorder?: (direction: 'up' | 'down', goalId: string) => void;
}

const GoalCard = ({ 
  goal, 
  onPress, 
  onEdit, 
  onDelete,
  onReorder 
}: GoalCardProps) => {
  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#e53935'; // Red
      case 'MEDIUM':
        return '#fb8c00'; // Orange
      case 'LOW':
        return '#43a047'; // Green
      default:
        return '#6200ee'; // Purple
    }
  };

  const priorityColor = getPriorityColor(goal.priority);

  return (
    <Card style={styles.card} mode="outlined">
      <View style={styles.cardHeader}>
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        {onReorder && (
          <View style={styles.reorderButtons}>
            <IconButton 
              icon="chevron-up" 
              size={20} 
              onPress={() => onReorder('up', goal.id)}
              style={styles.reorderButton}
            />
            <IconButton 
              icon="chevron-down" 
              size={20} 
              onPress={() => onReorder('down', goal.id)}
              style={styles.reorderButton}
            />
          </View>
        )}
      </View>
      
      <TouchableOpacity onPress={() => onPress(goal)}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{goal.title}</Text>
            <View style={styles.actionButtons}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => onEdit(goal)}
                  style={styles.iconButton}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="trash"
                  size={20}
                  onPress={() => onDelete(goal.id)}
                  style={styles.iconButton}
                />
              )}
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {goal.description}
          </Text>
          
          {goal.dueDate && (
            <View style={styles.dueDate}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.dueDateText}>{goal.dueDate}</Text>
            </View>
          )}
          
          {goal.tags && goal.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {goal.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{Math.round(goal.progress * 100)}%</Text>
            <ProgressBar 
              progress={goal.progress} 
              color={priorityColor} 
              style={styles.progressBar} 
            />
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityIndicator: {
    height: 8,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
    width: 36,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    flex: 1,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  reorderButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  reorderButton: {
    margin: 0,
    width: 24,
    height: 24,
  },
});

export default GoalCard; 