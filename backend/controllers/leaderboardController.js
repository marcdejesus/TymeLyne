const leaderboardService = require('../services/leaderboardService');

/**
 * Get global leaderboard
 * @route GET /api/leaderboards/global
 * @access Public
 */
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    console.log(`🎮 LEADERBOARD CONTROLLER: Getting global leaderboard with limit ${limit}`);
    
    const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);
    console.log(`✅ LEADERBOARD CONTROLLER: Returning ${leaderboard.length} global leaderboard entries`);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get friends leaderboard
 * @route GET /api/leaderboards/friends
 * @access Private
 */
exports.getFriendsLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    console.log(`🎮 LEADERBOARD CONTROLLER: Getting friends leaderboard for user ${req.user.id} with limit ${limit}`);
    
    const leaderboard = await leaderboardService.getFriendsLeaderboard(req.user.id, limit);
    console.log(`✅ LEADERBOARD CONTROLLER: Returning ${leaderboard.length} friend leaderboard entries`);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error fetching friends leaderboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 