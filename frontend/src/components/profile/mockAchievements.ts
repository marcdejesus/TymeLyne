import { Achievement } from './AchievementBadges';

export const mockAchievements: Achievement[] = [
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
    icon: 'award',
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
  },
  {
    id: '9',
    title: 'Social Butterfly',
    description: 'Connected with 5 friends',
    icon: 'users',
    dateUnlocked: null,
    selected: false,
    rarity: 'common'
  },
  {
    id: '10',
    title: 'Productivity Master',
    description: 'Completed 20 tasks in a single day',
    icon: 'activity',
    dateUnlocked: null,
    selected: false,
    rarity: 'legendary'
  },
  {
    id: '11',
    title: 'Perfectionist',
    description: 'Achieved 100% completion on 5 goals',
    icon: 'check-circle',
    dateUnlocked: '2023-07-12',
    selected: false,
    rarity: 'epic'
  },
  {
    id: '12',
    title: 'Quick Starter',
    description: 'Created 3 goals in your first week',
    icon: 'play',
    dateUnlocked: '2023-04-10',
    selected: false,
    rarity: 'common'
  }
]; 