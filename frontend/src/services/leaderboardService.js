import api from '../utils/api';

/**
 * Get global leaderboard data
 * @param {Number} limit - Maximum number of users to return
 * @returns {Promise} Promise object with leaderboard data
 */
export const getGlobalLeaderboard = async (limit = 100) => {
  try {
    console.log(`📊 Fetching global leaderboard data with limit ${limit}`);
    const response = await api.get(`/leaderboards/global?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    
    // Return mock data in case of error during development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock global leaderboard data due to API error');
      return generateMockGlobalLeaderboard();
    }
    throw new Error(error.response?.data?.message || 'Failed to load leaderboard data');
  }
};

/**
 * Get friends leaderboard data
 * @param {Number} limit - Maximum number of users to return
 * @returns {Promise} Promise object with friends leaderboard data
 */
export const getFriendsLeaderboard = async (limit = 100) => {
  try {
    console.log(`📊 Fetching friends leaderboard data with limit ${limit}`);
    const response = await api.get(`/leaderboards/friends?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    
    // Return mock data in case of error during development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock friends leaderboard data due to API error');
      return generateMockFriendsLeaderboard();
    }
    throw new Error(error.response?.data?.message || 'Failed to load friends leaderboard data');
  }
};

/**
 * Generate mock global leaderboard data for development and testing
 * @returns {Array} Array of mock leaderboard entries
 */
const generateMockGlobalLeaderboard = () => {
  return Array(100).fill().map((_, i) => ({
    id: `global-${i}`,
    username: `@user${i + 1}`,
    xp: Math.floor(Math.random() * 10000) + 1000,
    level: Math.floor(Math.random() * 30) + 1,
    rank: i + 1,
    avatar: null,
    isCurrentUser: i === 14
  })).sort((a, b) => b.xp - a.xp);
};

/**
 * Generate mock friends leaderboard data for development and testing
 * @returns {Array} Array of mock friend leaderboard entries
 */
const generateMockFriendsLeaderboard = () => {
  return Array(25).fill().map((_, i) => ({
    id: `friend-${i}`,
    username: `@friend${i + 1}`,
    xp: Math.floor(Math.random() * 8000) + 500,
    level: Math.floor(Math.random() * 20) + 1,
    rank: i + 1,
    lastActive: i < 5 ? 'today' : i < 10 ? 'yesterday' : `${i - 9} days ago`,
    avatar: null,
    isCurrentUser: i === 3
  })).sort((a, b) => b.xp - a.xp);
};

// Export all functions
export default {
  getGlobalLeaderboard,
  getFriendsLeaderboard
}; 