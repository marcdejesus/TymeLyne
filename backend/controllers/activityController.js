const activityService = require('../services/activityService');
const { calculateXpFromCompletion } = require('../utils/xpUtils');

/**
 * Get user's activity feed
 * @route GET /api/activity/feed
 * @access Private
 */
exports.getActivityFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const activities = await activityService.getActivityFeed(userId, limit, skip);
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting activity feed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's activities
 * @route GET /api/activity/user/:userId
 * @access Private
 */
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const activities = await activityService.getUserActivities(userId, limit, skip);
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting user activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Toggle like on an activity
 * @route POST /api/activity/:activityId/like
 * @access Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const activityId = req.params.activityId;
    const userId = req.user.id;
    const username = req.user.username;

    const activity = await activityService.toggleLike(activityId, userId, username);
    
    res.json(activity);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add comment to an activity
 * @route POST /api/activity/:activityId/comment
 * @access Private
 */
exports.addComment = async (req, res) => {
  try {
    const activityId = req.params.activityId;
    const userId = req.user.id;
    const username = req.user.username;
    const profilePicture = req.user.profile_picture || '';
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const activity = await activityService.addComment(activityId, userId, username, profilePicture, text);
    
    res.json(activity);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's XP history
 * @route GET /api/activity/xp-history
 * @access Private
 */
exports.getXpHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'monthly';
    const limit = parseInt(req.query.limit) || 12;

    // Validate period
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Must be daily, weekly, or monthly' });
    }

    const xpHistory = await activityService.getXpHistory(userId, period, limit);
    
    res.json(xpHistory);
  } catch (error) {
    console.error('Error getting XP history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Record a level up activity
 * @route POST /api/activity/level-up
 * @access Private
 */
exports.recordLevelUp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.body;

    if (!level) {
      return res.status(400).json({ message: 'Level is required' });
    }

    const activity = await activityService.recordLevelUp(userId, level);
    
    res.json(activity);
  } catch (error) {
    console.error('Error recording level up:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Record a course completion activity
 * @route POST /api/activity/course-completion
 * @access Private
 */
exports.recordCourseCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, xpEarned } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Get course data
    const courseService = require('../services/courseService');
    const courseData = await courseService.getCourseById(courseId);

    if (!courseData) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Record the activity
    const activity = await activityService.recordCourseCompletion(
      userId, 
      courseData, 
      xpEarned || 0
    );
    
    res.json(activity);
  } catch (error) {
    console.error('Error recording course completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Record a section completion activity
 * @route POST /api/activity/section-completion
 * @access Private
 */
exports.recordSectionCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, sectionId, xpEarned } = req.body;

    if (!courseId || !sectionId) {
      return res.status(400).json({ message: 'Course ID and Section ID are required' });
    }

    // Get course data
    const courseService = require('../services/courseService');
    const courseData = await courseService.getCourseById(courseId);

    if (!courseData) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the section
    const sectionData = courseData.sections?.find(section => 
      section._id.toString() === sectionId || section.section_id === sectionId
    );

    if (!sectionData) {
      return res.status(404).json({ message: 'Section not found in course' });
    }

    // Record the activity
    const activity = await activityService.recordSectionCompletion(
      userId, 
      courseData, 
      sectionData, 
      xpEarned || 0
    );
    
    res.json(activity);
  } catch (error) {
    console.error('Error recording section completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 