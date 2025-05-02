const Profile = require('../models/profile');

/**
 * Get global leaderboard data sorted by XP
 * @param {Number} limit - Maximum number of users to return
 * @returns {Array} Array of leaderboard entries
 */
const getGlobalLeaderboard = async (limit = 100) => {
  try {
    console.log(`📊 LEADERBOARD: Fetching global leaderboard with limit ${limit}`);
    
    // Get profiles sorted by XP in descending order
    const profiles = await Profile.find({}, {
      user_id: 1,
      username: 1,
      user_total_exp: 1,
      level: 1,
      profile_picture: 1,
      created_at: 1
    })
    .sort({ user_total_exp: -1 })
    .limit(limit);
    
    console.log(`📊 LEADERBOARD: Found ${profiles.length} profiles for global leaderboard`);
    
    return profiles.map((profile, index) => ({
      id: profile.user_id,
      username: profile.username || `User${profile.user_id.slice(-4)}`,
      xp: profile.user_total_exp || 0,
      level: profile.level || 1,
      rank: index + 1,
      avatar: profile.profile_picture || null,
      // Calculate trend (placeholder for now - would be based on historical data)
      trend: Math.floor(Math.random() * 40) - 20,
      // Add last active based on created_at for now
      lastActive: getTimeAgo(profile.created_at)
    }));
  } catch (error) {
    console.error('❌ Error fetching global leaderboard:', error);
    throw error;
  }
};

/**
 * Get friends leaderboard for a specific user
 * @param {String} userId - The user's ID
 * @param {Number} limit - Maximum number of users to return
 * @returns {Array} Array of friend leaderboard entries
 */
const getFriendsLeaderboard = async (userId, limit = 100) => {
  try {
    console.log(`📊 LEADERBOARD: Fetching friends leaderboard for user ${userId}`);
    
    // Get the user's profile
    const userProfile = await Profile.findOne({ user_id: userId });
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    // If you don't have a friends list yet, we'll just return a small set of random users
    // In the future, this would use a friends/connections collection
    const friendProfiles = await Profile.find(
      { user_id: { $ne: userId } },
      {
        user_id: 1,
        username: 1,
        user_total_exp: 1,
        level: 1,
        profile_picture: 1,
        created_at: 1
      }
    )
    .sort({ user_total_exp: -1 })
    .limit(limit);
    
    console.log(`📊 LEADERBOARD: Found ${friendProfiles.length} profiles for friends leaderboard`);
    
    // Add the current user to the list
    const currentUserData = {
      user_id: userProfile.user_id,
      username: userProfile.username,
      user_total_exp: userProfile.user_total_exp || 0,
      level: userProfile.level || 1,
      profile_picture: userProfile.profile_picture,
      created_at: userProfile.created_at,
      isCurrentUser: true
    };
    
    // Combine and sort by XP
    const allProfiles = [
      ...friendProfiles,
      currentUserData
    ].sort((a, b) => (b.user_total_exp || 0) - (a.user_total_exp || 0));
    
    return allProfiles.map((profile, index) => ({
      id: profile.user_id,
      username: profile.username || `User${profile.user_id.slice(-4)}`,
      xp: profile.user_total_exp || 0,
      level: profile.level || 1,
      rank: index + 1,
      avatar: profile.profile_picture || null,
      isCurrentUser: !!profile.isCurrentUser,
      // Calculate trend (placeholder for now)
      trend: Math.floor(Math.random() * 40) - 20,
      // Add last active based on created_at for now
      lastActive: getTimeAgo(profile.created_at)
    }));
  } catch (error) {
    console.error('❌ Error fetching friends leaderboard:', error);
    throw error;
  }
};

/**
 * Helper function to get human-readable time ago
 * @param {Date} date - The date to calculate time ago from
 * @returns {String} Human readable time ago (e.g. "2 days ago")
 */
const getTimeAgo = (date) => {
  if (!date) return 'recently';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

module.exports = {
  getGlobalLeaderboard,
  getFriendsLeaderboard
}; 