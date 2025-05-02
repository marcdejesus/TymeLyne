import api from '../utils/api';

/**
 * Get user activity feed
 * @param {Object} options - Query options
 * @param {Number} options.limit - Maximum number of activities to return
 * @param {Number} options.skip - Number of activities to skip (for pagination)
 * @returns {Promise} Promise object with activity feed data
 */
export const getActivityFeed = async (options = {}) => {
  try {
    const { limit = 20, skip = 0 } = options;
    console.log(`📱 Fetching activity feed with limit ${limit}, skip ${skip}`);
    
    const response = await api.get(`/activity/feed?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    
    // Return mock data during development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock activity feed data due to API error');
      return generateMockActivityFeed();
    }
    
    throw error;
  }
};

/**
 * Get XP history data for a user
 * @param {Object} options - Query options
 * @param {String} options.period - Period type ('daily', 'weekly', 'monthly')
 * @param {Number} options.limit - Maximum number of data points to return
 * @returns {Promise} Promise object with XP history data
 */
export const getXpHistory = async (options = {}) => {
  try {
    const { period = 'monthly', limit = 12 } = options;
    console.log(`📱 Fetching XP history with period ${period}, limit ${limit}`);
    
    const response = await api.get(`/activity/xp-history?period=${period}&limit=${limit}`);
    
    // If the API returns empty data, use mock data
    if (!response.data || response.data.length === 0) {
      console.log(`📊 API returned empty XP history data for ${period}, using mock data instead`);
      return generateMockXpHistory(period, limit);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching XP history:', error);
    
    // Return mock data during development or on error
    console.warn('Using mock XP history data due to API error');
    return generateMockXpHistory(options.period, options.limit);
  }
};

/**
 * Toggle like on an activity
 * @param {String} activityId - ID of the activity to like/unlike
 * @returns {Promise} Promise object with updated activity data
 */
export const toggleActivityLike = async (activityId) => {
  try {
    console.log(`📱 Toggling like for activity ${activityId}`);
    
    const response = await api.post(`/activity/${activityId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling activity like:', error);
    throw error;
  }
};

/**
 * Add comment to an activity
 * @param {String} activityId - ID of the activity to comment on
 * @param {String} text - Comment text
 * @returns {Promise} Promise object with updated activity data
 */
export const addActivityComment = async (activityId, text) => {
  try {
    console.log(`📱 Adding comment to activity ${activityId}`);
    
    const response = await api.post(`/activity/${activityId}/comment`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding activity comment:', error);
    throw error;
  }
};

/**
 * Generate mock activity feed data for development
 * @returns {Array} Array of mock activity items
 */
const generateMockActivityFeed = () => {
  return [
    {
      _id: 'mock-activity-1',
      type: 'course_completion',
      title: 'JavaScript Fundamentals',
      description: 'Completed the JavaScript Fundamentals course',
      xp_earned: 500,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      likes: [
        { user_id: 'user1', username: '@john' },
        { user_id: 'user2', username: '@sarah' }
      ],
      comments: [
        { 
          user_id: 'user2', 
          username: '@sarah', 
          text: 'Great job! JavaScript is so useful!',
          created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        }
      ]
    },
    {
      _id: 'mock-activity-2',
      type: 'section_completion',
      title: 'Variables and Data Types',
      description: 'Completed Variables and Data Types in JavaScript Fundamentals',
      xp_earned: 100,
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      likes: [],
      comments: []
    },
    {
      _id: 'mock-activity-3',
      type: 'level_up',
      title: 'Level 3',
      description: 'Reached Level 3',
      xp_earned: 0,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      likes: [
        { user_id: 'user1', username: '@john' },
        { user_id: 'user3', username: '@mike' },
        { user_id: 'user4', username: '@jessica' },
        { user_id: 'user5', username: '@alex' },
        { user_id: 'user6', username: '@emma' }
      ],
      comments: [
        { 
          user_id: 'user3', 
          username: '@mike', 
          text: 'Congrats on reaching level 3!',
          created_at: new Date(Date.now() - 84600000).toISOString()
        },
        { 
          user_id: 'user4', 
          username: '@jessica', 
          text: 'Way to go!',
          created_at: new Date(Date.now() - 82800000).toISOString()
        }
      ]
    }
  ];
};

/**
 * Generate mock XP history data for development
 * @param {String} period - Period type ('daily', 'weekly', 'monthly')
 * @param {Number} limit - Number of data points to generate
 * @returns {Array} Array of mock XP history data points
 */
const generateMockXpHistory = (period = 'monthly', limit = 12) => {
  const now = new Date();
  const data = [];
  
  // Start with user's total XP and work backwards
  // This creates a realistic progression curve
  let totalXp = 1900; // Starting with current total XP
  
  for (let i = 0; i < limit; i++) {
    const date = new Date(now);
    
    // Set the date based on the period
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - i);
        break;
      case 'weekly':
        date.setDate(date.getDate() - (i * 7));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - i);
        break;
    }
    
    // For realistic data, reduce the XP as we go back in time
    // This creates an upward progression curve
    if (i > 0) {
      // Each step back in time reduces XP by a random amount
      const reduction = Math.floor(100 + Math.random() * 200);
      totalXp = Math.max(0, totalXp - reduction);
    }
    
    // Create the data point using the format from the backend
    data.push({
      _id: `mock-xp-${period}-${i}`,
      user_id: 'current-user',
      xp: totalXp,
      level: Math.ceil(Math.sqrt(totalXp / 100)), // Simple level calculation
      date: date.toISOString(),
      period,
      sources: [] // In a real app, this would contain activities that earned XP
    });
  }
  
  // Return data in reverse chronological order (newest first)
  return data.reverse();
}; 