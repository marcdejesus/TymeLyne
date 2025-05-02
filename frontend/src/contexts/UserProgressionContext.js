import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProgressionData, recordLevelUp } from '../services/userProgressionService';

// Create the progression context
export const UserProgressionContext = createContext();

// Create a hook to use the progression context
export const useUserProgression = () => {
  const context = useContext(UserProgressionContext);
  if (!context) {
    throw new Error('useUserProgression must be used within a UserProgressionProvider');
  }
  return context;
};

// Create the Provider component
export const UserProgressionProvider = ({ children }) => {
  const [progressData, setProgressData] = useState({
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    totalXpForNextLevel: 500,
    levelProgress: 0,
    userId: null,
    username: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousLevel, setPreviousLevel] = useState(null);
  const [isLevelUp, setIsLevelUp] = useState(false);

  // Fetch user progression data from backend
  const fetchUserProgression = async () => {
    try {
      setError(null);
      const data = await getUserProgressionData();
      console.log('UserProgressionContext: Data received:', data);
      
      // Store previous level for level-up animation
      if (previousLevel === null) {
        setPreviousLevel(data.level || 1);
      } else if (data.level > previousLevel) {
        // Level up detected
        setIsLevelUp(true);
        
        // Record level up in activity feed
        handleLevelUp(data.level);
        
        // Update previous level
        setPreviousLevel(data.level);
      }
      
      // Ensure data has required fields
      setProgressData({
        level: data.level || 1,
        totalXp: data.totalXp || 0,
        currentLevelXp: data.currentLevelXp || 0,
        totalXpForNextLevel: data.totalXpForNextLevel || 500,
        levelProgress: data.levelProgress || 0,
        userId: data.userId,
        username: data.username,
        // Support both field naming patterns
        xpToNextLevel: data.xpToNextLevel || data.totalXpForNextLevel || 500
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching user progression data:', error);
      setError('Failed to fetch progression data');
      
      // Don't overwrite existing data on refresh error
      if (!progressData.level) {
        setProgressData({
          level: 1,
          totalXp: 0,
          currentLevelXp: 0,
          totalXpForNextLevel: 500,
          levelProgress: 0
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle level up by recording it in the activity feed
  const handleLevelUp = async (newLevel) => {
    if (newLevel > 1) {
      try {
        console.log(`🎉 Level Up! Recording level ${newLevel} achievement in activity feed`);
        await recordLevelUp(newLevel);
      } catch (error) {
        console.error('Error recording level up activity:', error);
        // Continue even if recording fails - this is a non-critical operation
      }
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUserProgression();
    
    // Set up interval to refresh data every 2 minutes
    const refreshInterval = setInterval(fetchUserProgression, 120000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Update progression with new data (e.g., after completing a course section)
  const updateProgression = (newProgressData) => {
    if (!newProgressData) return;
    
    console.log('UserProgressionContext: Updating progression data:', newProgressData);
    
    // Check for level up
    if (newProgressData.level > (progressData.level || 1)) {
      setIsLevelUp(true);
      
      // Record level up in activity feed
      handleLevelUp(newProgressData.level);
      
      // Update previous level
      setPreviousLevel(progressData.level);
    }
    
    // Update the progression data
    setProgressData(prev => ({
      ...prev,
      level: newProgressData.level || prev.level,
      totalXp: newProgressData.totalXp || prev.totalXp,
      currentLevelXp: newProgressData.currentLevelXp || prev.currentLevelXp,
      totalXpForNextLevel: newProgressData.totalXpForNextLevel || prev.totalXpForNextLevel,
      levelProgress: newProgressData.levelProgress || prev.levelProgress,
      userId: newProgressData.userId || prev.userId,
      username: newProgressData.username || prev.username
    }));
  };

  // Reset level up flag after animation
  const resetLevelUp = () => {
    setIsLevelUp(false);
  };

  return (
    <UserProgressionContext.Provider
      value={{
        progressData,
        loading,
        error,
        isLevelUp,
        fetchUserProgression,
        updateProgression,
        resetLevelUp
      }}
    >
      {children}
    </UserProgressionContext.Provider>
  );
};

export default UserProgressionProvider; 