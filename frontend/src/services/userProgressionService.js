import api from '../utils/api';

/**
 * Get the current user's progression data including level and XP
 * @returns {Promise} Promise object with user progression data
 */
export const getUserProgressionData = async () => {
  try {
    // Try the direct progression endpoint first (most compatible)
    try {
      const response = await api.get('/progression');
      console.log('📊 Progression data received from /progression');
      return response.data;
    } catch (directError) {
      // Only log detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Trying API progression endpoints after direct endpoint failed');
      }
      
      // Try multiple API endpoints silently
      try {
        // Try /api/profiles/progression first
        const profilesResponse = await api.get('/profiles/progression');
        console.log('📊 Progression data received from /profiles/progression');
        return profilesResponse.data;
      } catch (profilesError) {
        // Try /api/profile/progression as a fallback
        const profileResponse = await api.get('/profile/progression');
        console.log('📊 Progression data received from /profile/progression');
        return profileResponse.data;
      }
    }
  } catch (error) {
    // Only log detailed error in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user progression data:', error.message);
    }
    
    // Return fallback data if server is unreachable
    if (error.message.includes("Network Error") || 
        error.response?.status === 404 || 
        error.response?.status === 401) {
      // Use a less noisy message
      console.log('Using fallback progression data');
      return {
        level: 1,
        totalXp: 0,
        currentLevelXp: 0,
        totalXpForNextLevel: 500,
        levelProgress: 0
      };
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch user progression data');
  }
};

/**
 * Calculate the percentage of progress to the next level
 * @param {Number} currentXp - Current XP in the level
 * @param {Number} nextLevelXp - XP required for the next level
 * @returns {Number} Percentage of progress (0-100)
 */
export const calculateLevelProgress = (currentXp, nextLevelXp) => {
  if (!nextLevelXp || nextLevelXp <= 0) return 0;
  const percentage = (currentXp / nextLevelXp) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Ensure between 0-100
};

// Export all functions
export default {
  getUserProgressionData,
  calculateLevelProgress
}; 