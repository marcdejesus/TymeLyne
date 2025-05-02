const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/leaderboards/global
 * @desc    Get global leaderboard data
 * @access  Public
 */
router.get('/global', leaderboardController.getGlobalLeaderboard);

/**
 * @route   GET /api/leaderboards/friends
 * @desc    Get friends leaderboard data
 * @access  Private (requires authentication)
 */
router.get('/friends', protect, leaderboardController.getFriendsLeaderboard);

module.exports = router; 