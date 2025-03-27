import React from 'react';
import { render, act, waitFor, renderHook } from '@testing-library/react-native';
import { TaskProvider, useTask } from '../TaskContext';
import { useAuth } from '../AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock AuthContext
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('TaskContext', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock AsyncStorage functions
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    
    // Default mock implementation
    AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
    AsyncStorage.setItem.mockImplementation(() => Promise.resolve());
    
    // Mock Auth context
    useAuth.mockImplementation(() => ({
      user: { id: '1', name: 'Test User', xp: 100, coins: 50 },
      login: jest.fn(),
    }));
  });

  it('should initialize with default tasks if no tasks in storage', async () => {
    // Setup
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(null);
      if (key === 'taskStats') return Promise.resolve(null);
      return Promise.resolve(null);
    });

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for async operations to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert default tasks are loaded
    expect(result.current.tasks.length).toBe(3);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('tasks', expect.any(String));
  });

  it('should load tasks from storage if available', async () => {
    // Mock stored tasks
    const storedTasks = [
      { id: '10', title: 'Test task', completed: false, xp: 10, coins: 5 }
    ];
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(JSON.stringify(storedTasks));
      if (key === 'taskStats') return Promise.resolve(JSON.stringify({ completedToday: 0 }));
      return Promise.resolve(null);
    });

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for async operations to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert stored tasks are loaded
    expect(result.current.tasks).toEqual(storedTasks);
  });

  it('should add a new task', async () => {
    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Add a task
    await act(async () => {
      await result.current.addTask('New test task');
    });

    // Assert task was added
    expect(result.current.tasks[0].title).toBe('New test task');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('tasks', expect.any(String));
  });

  it('should toggle task completion status', async () => {
    // Mock stored tasks
    const storedTasks = [
      { id: '1', title: 'Test task', completed: false, xp: 10, coins: 5 }
    ];
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(JSON.stringify(storedTasks));
      return Promise.resolve(null);
    });
    
    // Setup auth mock
    const loginMock = jest.fn();
    useAuth.mockImplementation(() => ({
      user: { id: '1', name: 'Test User', xp: 100, coins: 50 },
      login: loginMock,
    }));

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Toggle task
    await act(async () => {
      await result.current.toggleTask('1');
    });

    // Assert task was toggled
    expect(result.current.tasks[0].completed).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('tasks', expect.any(String));
    
    // Assert user data was updated
    expect(loginMock).toHaveBeenCalledWith({
      id: '1',
      name: 'Test User',
      xp: 110, // 100 + 10
      coins: 55, // 50 + 5
    });
  });

  it('should delete a task', async () => {
    // Mock stored tasks
    const storedTasks = [
      { id: '1', title: 'Test task 1', completed: false, xp: 10, coins: 5 },
      { id: '2', title: 'Test task 2', completed: false, xp: 20, coins: 10 }
    ];
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(JSON.stringify(storedTasks));
      return Promise.resolve(null);
    });

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Delete a task
    await act(async () => {
      await result.current.deleteTask('1');
    });

    // Assert task was deleted
    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].id).toBe('2');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('tasks', expect.any(String));
  });

  it('should reset daily tasks', async () => {
    // Mock stored tasks with some completed
    const storedTasks = [
      { id: '1', title: 'Test task 1', completed: true, xp: 10, coins: 5 },
      { id: '2', title: 'Test task 2', completed: false, xp: 20, coins: 10 }
    ];
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(JSON.stringify(storedTasks));
      if (key === 'taskStats') return Promise.resolve(JSON.stringify({ completedToday: 1 }));
      return Promise.resolve(null);
    });

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset daily tasks
    await act(async () => {
      await result.current.resetDailyTasks();
    });

    // Assert tasks were reset
    expect(result.current.tasks[0].completed).toBe(false);
    expect(result.current.tasks[1].completed).toBe(false);
    
    // Assert stats were updated
    const stats = result.current.getStats();
    expect(stats.completedToday).toBe(0);
  });

  it('should return correct stats', async () => {
    // Mock stored tasks with some completed
    const storedTasks = [
      { id: '1', title: 'Test task 1', completed: true, xp: 10, coins: 5 },
      { id: '2', title: 'Test task 2', completed: false, xp: 20, coins: 10 },
      { id: '3', title: 'Test task 3', completed: true, xp: 30, coins: 15 }
    ];
    
    const storedStats = {
      completedToday: 2,
      totalXpEarned: 40,
      totalCoinsEarned: 20
    };
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'tasks') return Promise.resolve(JSON.stringify(storedTasks));
      if (key === 'taskStats') return Promise.resolve(JSON.stringify(storedStats));
      return Promise.resolve(null);
    });

    // Render hook with TaskProvider
    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTask(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Get stats
    const stats = result.current.getStats();
    
    // Assert stats are correct
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(2);
    expect(stats.completedToday).toBe(2);
    expect(stats.totalXpEarned).toBe(40);
    expect(stats.totalCoinsEarned).toBe(20);
  });
}); 