import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Card, IconButton, ProgressBar, Badge, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { Goal } from '../goals/GoalCard';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}

interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  date?: string;
}

interface DashboardProps {
  userXp: number;
  userLevel: number;
  nextLevelXp: number;
  goals: Goal[];
  tasks: Task[];
  badges: Badge[];
  onTaskPress: (taskId: string) => void;
  onGoalPress: (goal: Goal) => void;
  username: string;
  avatarUrl?: string;
  pageTitle: string;
  userRole?: string;
}

const Dashboard = ({
  userXp,
  userLevel,
  nextLevelXp,
  goals,
  tasks,
  badges,
  onTaskPress,
  onGoalPress,
  username,
  avatarUrl,
  pageTitle,
  userRole = 'USER',
}: DashboardProps) => {
  const [completedToday, setCompletedToday] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    // Calculate tasks completed today
    const completedTasks = tasks.filter(t => t.completed).length;
    setCompletedToday(completedTasks);
  }, [tasks]);
  
  useEffect(() => {
    if (showLevelUp) {
      // Create a pulse animation for the level up notification
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide the level up notification after animation
        setTimeout(() => setShowLevelUp(false), 2000);
      });
    }
  }, [showLevelUp, pulseAnim]);

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.levelInfo}>
        <Text style={styles.levelText}>Level {userLevel}</Text>
        <Text style={styles.xpText}>{userXp}/{nextLevelXp} XP</Text>
      </View>
      <ProgressBar
        progress={userXp / nextLevelXp}
        color="#6200ee"
        style={styles.progressBar}
      />
    </View>
  );

  const renderTodayTasks = () => (
    <Card style={styles.todayCard}>
      <Card.Title
        title="Today's Tasks"
        subtitle={`${completedToday}/${tasks.length} completed`}
        left={(props) => <Icon name="check-square" {...props} size={24} color="#6200ee" />}
      />
      <Card.Content>
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskItem, task.completed && styles.taskCompleted]}
              onPress={() => onTaskPress(task.id)}
            >
              <View style={styles.taskCheckbox}>
                {task.completed ? (
                  <Icon name="check-circle" size={20} color="#6200ee" />
                ) : (
                  <Icon name="circle" size={20} color="#e0e0e0" />
                )}
              </View>
              <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                {task.title}
              </Text>
              {task.category && (
                <View style={styles.taskCategory}>
                  <Text style={styles.taskCategoryText}>{task.category}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoals = () => (
    <Card style={styles.goalsCard}>
      <Card.Title
        title="Your Goals"
        subtitle="Track your progress"
        left={(props) => <Icon name="target" {...props} size={24} color="#6200ee" />}
      />
      <Card.Content>
        <View style={styles.goalsList}>
          {goals.slice(0, 3).map((goal) => (
            <TouchableOpacity 
              key={goal.id} 
              style={styles.goalItem}
              onPress={() => onGoalPress(goal)}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalProgress}>{Math.round(goal.progress * 100)}%</Text>
              </View>
              <ProgressBar
                progress={goal.progress}
                color="#6200ee"
                style={styles.goalProgressBar}
              />
            </TouchableOpacity>
          ))}
          {goals.length > 3 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all goals</Text>
              <Icon name="chevron-right" size={16} color="#6200ee" />
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderBadges = () => (
    <Card style={styles.badgesCard}>
      <Card.Title
        title="Your Achievements"
        subtitle="Badges and rewards"
        left={(props) => <Icon name="award" {...props} size={24} color="#6200ee" />}
      />
      <Card.Content>
        <View style={styles.badgesList}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                <Icon name={badge.icon} size={24} color={badge.earned ? "#6200ee" : "#bdbdbd"} />
              </View>
              <Text style={[styles.badgeTitle, !badge.earned && styles.badgeTitleLocked]}>
                {badge.title}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderLevelUpNotification = () => (
    <Animated.View 
      style={[
        styles.levelUpContainer,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <View style={styles.levelUpContent}>
        <Icon name="award" size={32} color="#6200ee" />
        <Text style={styles.levelUpText}>Level Up!</Text>
        <Text style={styles.newLevelText}>You've reached level {userLevel}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderProgressBar()}
        {renderTodayTasks()}
        {renderGoals()}
        {renderBadges()}
      </View>
      
      {showLevelUp && renderLevelUpNotification()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  xpText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  todayCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskCompleted: {
    opacity: 0.7,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  taskCategoryText: {
    fontSize: 12,
    color: '#6200ee',
  },
  goalsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  goalsList: {
    marginTop: 8,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  goalProgress: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  seeAllText: {
    color: '#6200ee',
    marginRight: 4,
    fontWeight: '500',
  },
  badgesCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  badgeItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconLocked: {
    backgroundColor: '#f5f5f5',
  },
  badgeTitle: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: '#bdbdbd',
  },
  levelUpContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -125,
    marginTop: -75,
    width: 250,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  levelUpContent: {
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 12,
  },
  newLevelText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default Dashboard; 