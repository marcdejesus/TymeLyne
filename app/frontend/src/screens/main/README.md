# Task Management Feature

## Overview

The task management feature allows users to track their daily learning tasks, earn rewards (XP and coins), and visualize their progress. It integrates with the rest of the app to provide a gamified learning experience.

## Components

### TaskScreen
The main screen for task management, allowing users to:
- View their current tasks
- Add new tasks
- Mark tasks as complete
- Delete tasks
- View their progress statistics
- See reward popups when completing tasks
- Filter tasks by completion status

### TaskItem
A reusable component that displays a single task with:
- Completion checkbox
- Task title
- XP and coin rewards
- Delete button
- Animated feedback when completing or uncompleting tasks

### TaskStats
A reusable component that displays task statistics:
- Task completion progress bar
- Total XP earned
- Total coins earned
- Tasks completed today

### RewardPopup
A popup component that shows animated rewards when tasks are completed:
- Displays XP and coins earned
- Animates in and out with scale, opacity, and position
- Automatically disappears after a set time

### TaskFilter
A segmented control component that filters tasks by status:
- All tasks
- Active (uncompleted) tasks
- Completed tasks
- Shows count badge for each category

## Context

### TaskContext
Manages the state of tasks across the application:
- Stores tasks in AsyncStorage for persistence
- Provides functions for adding, toggling, and deleting tasks
- Tracks task statistics
- Handles daily task resets
- Updates user XP and coins in AuthContext when tasks are completed

## Animations

The feature includes several animations to enhance user experience:
- Task completion: Items scale up briefly when checked
- Task interaction: Items briefly fade when tapped
- Reward popup: Slides and fades in when a task is completed
- Progress bars: Visual feedback for task completion progress

## Usage

### Adding tasks
```jsx
const { addTask } = useTask();
addTask('Complete React Native tutorial');
```

### Toggling task completion
```jsx
const { toggleTask } = useTask();
toggleTask(taskId);
```

### Deleting tasks
```jsx
const { deleteTask } = useTask();
deleteTask(taskId);
```

### Getting task stats
```jsx
const { getStats } = useTask();
const stats = getStats();
// stats.total - Total number of tasks
// stats.completed - Number of completed tasks
// stats.completedToday - Number of tasks completed today
// stats.totalXpEarned - Total XP earned from tasks
// stats.totalCoinsEarned - Total coins earned from tasks
```

### Showing reward popup
```jsx
// In your component:
const [showReward, setShowReward] = useState(false);
const [currentReward, setCurrentReward] = useState({ xp: 0, coins: 0 });

// When task is completed:
setCurrentReward({ xp: 50, coins: 10 });
setShowReward(true);

// In your JSX:
<RewardPopup 
  visible={showReward}
  reward={currentReward}
  onAnimationComplete={() => setShowReward(false)}
/>
```

### Using task filters
```jsx
// In your component:
const [filter, setFilter] = useState('all');

// Filter tasks based on selected filter
const filteredTasks = useMemo(() => {
  switch (filter) {
    case 'active':
      return tasks.filter(task => !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks;
  }
}, [tasks, filter]);

// In your JSX:
<TaskFilter 
  currentFilter={filter}
  onFilterChange={setFilter}
  counts={{ 
    all: tasks.length, 
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length 
  }}
/>
```

## Integration

The task management feature is integrated with the app's navigation and auth system:
- TaskScreen is accessible from the main tab navigator
- Task completion rewards (XP and coins) are displayed in the user's profile
- Tasks are persisted across app sessions using AsyncStorage
- Completing tasks updates the user's XP and coins in the AuthContext 