import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Title, Divider, Switch, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  defaultValue: boolean;
}

interface NotificationSettingsProps {
  onSettingsChange: (settings: Record<string, boolean>) => void;
}

const notificationOptions: NotificationOption[] = [
  {
    id: 'goal_reminders',
    title: 'Goal Reminders',
    description: 'Get reminders for upcoming goal milestones and deadlines',
    icon: 'target',
    defaultValue: true,
  },
  {
    id: 'task_due',
    title: 'Task Due Soon',
    description: 'Notify me before a task is due',
    icon: 'clock',
    defaultValue: true,
  },
  {
    id: 'achievements',
    title: 'Achievement Unlocked',
    description: 'Celebrate when you earn badges and level up',
    icon: 'award',
    defaultValue: true,
  },
  {
    id: 'friend_activity',
    title: 'Friend Activity',
    description: 'Know when your friends complete goals or earn badges',
    icon: 'users',
    defaultValue: false,
  },
  {
    id: 'tips',
    title: 'Tips & Advice',
    description: 'Helpful suggestions to improve your progress',
    icon: 'bell',
    defaultValue: false,
  },
  {
    id: 'weekly_summary',
    title: 'Weekly Summary',
    description: 'Get a weekly report of your goals and progress',
    icon: 'bar-chart-2',
    defaultValue: true,
  },
];

const NotificationSettings = ({ onSettingsChange }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    // Initialize state with the default values
    Object.fromEntries(
      notificationOptions.map(option => [option.id, option.defaultValue])
    )
  );

  const handleToggle = (id: string) => {
    const newSettings = {
      ...settings,
      [id]: !settings[id],
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Notification Preferences</Title>
      <Divider style={styles.divider} />
      
      <List.Section>
        {notificationOptions.map((option) => (
          <List.Item
            key={option.id}
            title={option.title}
            description={option.description}
            left={props => <Icon name={option.icon} size={24} color="#6200ee" style={styles.icon} />}
            right={props => (
              <Switch
                value={settings[option.id]}
                onValueChange={() => handleToggle(option.id)}
                color="#6200ee"
              />
            )}
            style={styles.listItem}
          />
        ))}
      </List.Section>
      
      <View style={styles.infoContainer}>
        <Icon name="info" size={16} color="#666" />
        <Text style={styles.infoText}>
          You can change these notification settings at any time
        </Text>
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
  listItem: {
    paddingVertical: 8,
  },
  icon: {
    marginRight: 12,
    marginLeft: 0,
    alignSelf: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});

export default NotificationSettings; 