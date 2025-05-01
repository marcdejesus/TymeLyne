import api from '../utils/api';

/**
 * Get the current user's progression data including level and XP
 * @returns {Promise} Promise object with user progression data
 */
export const getUserProgressionData = async () => {
  try {
    const response = await api.get('/profile/progression');
    return response.data;
  } catch (error) {
    console.error('Error fetching user progression data:', error);
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