const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/activity/feed
 * @desc    Get user's activity feed (own activities + followed users)
 * @access  Private
 */
router.get('/feed', activityController.getActivityFeed);

/**
 * @route   GET /api/activity/user/:userId
 * @desc    Get activities for a specific user
 * @access  Private
 */
router.get('/user/:userId', activityController.getUserActivities);

/**
 * @route   POST /api/activity/:activityId/like
 * @desc    Toggle like on an activity
 * @access  Private
 */
router.post('/:activityId/like', activityController.toggleLike);

/**
 * @route   POST /api/activity/:activityId/comment
 * @desc    Add comment to an activity
 * @access  Private
 */
router.post('/:activityId/comment', activityController.addComment);

/**
 * @route   GET /api/activity/xp-history
 * @desc    Get user's XP history
 * @access  Private
 */
router.get('/xp-history', activityController.getXpHistory);

/**
 * @route   POST /api/activity/level-up
 * @desc    Record a level up activity
 * @access  Private
 */
router.post('/level-up', activityController.recordLevelUp);

/**
 * @route   POST /api/activity/course-completion
 * @desc    Record a course completion activity
 * @access  Private
 */
router.post('/course-completion', activityController.recordCourseCompletion);

/**
 * @route   POST /api/activity/section-completion
 * @desc    Record a section completion activity
 * @access  Private
 */
router.post('/section-completion', activityController.recordSectionCompletion);

module.exports = router; 