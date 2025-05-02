const UserActivity = require('../models/userActivity');
const XpHistory = require('../models/xpHistory');
const Profile = require('../models/profile');

/**
 * Create a new activity record for a user
 * 
 * @param {Object} activityData - Activity data object
 * @returns {Object} Created activity document
 */
const createActivity = async (activityData) => {
  try {
    console.log('🏆 ACTIVITY: Creating new activity', activityData);
    
    // Create the activity
    const activity = new UserActivity(activityData);
    await activity.save();
    
    console.log(`✅ ACTIVITY: Created new activity of type "${activity.type}" for user ${activity.user_id}`);
    return activity;
  } catch (error) {
    console.error('❌ Error creating activity:', error);
    throw error;
  }
};

/**
 * Record a course completion activity
 * 
 * @param {String} userId - User ID
 * @param {Object} courseData - Course data
 * @param {Number} xpEarned - XP earned
 * @returns {Object} Created activity document
 */
const recordCourseCompletion = async (userId, courseData, xpEarned) => {
  try {
    // Get user info for the activity
    const userProfile = await Profile.findOne({ user_id: userId });
    
    // Create activity record
    const activity = await createActivity({
      user_id: userId,
      type: 'course_completion',
      title: courseData.title || courseData.course_name || 'Untitled Course',
      description: `Completed the ${courseData.title || courseData.course_name || 'Untitled Course'} course`,
      xp_earned: xpEarned,
      metadata: {
        course_id: courseData._id || courseData.course_id,
        sections_count: courseData.sections?.length || 0,
        difficulty: courseData.difficulty
      }
    });
    
    // Update XP history with this activity
    await updateXpHistory(userId, xpEarned, 'course_completion', {
      title: courseData.title || courseData.course_name || 'Untitled Course',
      id: courseData._id || courseData.course_id
    });
    
    return activity;
  } catch (error) {
    console.error('❌ Error recording course completion:', error);
    throw error;
  }
};

/**
 * Record a section completion activity
 * 
 * @param {String} userId - User ID
 * @param {Object} courseData - Course data
 * @param {Object} sectionData - Section data
 * @param {Number} xpEarned - XP earned
 * @returns {Object} Created activity document
 */
const recordSectionCompletion = async (userId, courseData, sectionData, xpEarned) => {
  try {
    // Create activity record
    const activity = await createActivity({
      user_id: userId,
      type: 'section_completion',
      title: sectionData.title || 'Untitled Section',
      description: `Completed ${sectionData.title || 'Untitled Section'} in ${courseData.title || courseData.course_name || 'Untitled Course'}`,
      xp_earned: xpEarned,
      metadata: {
        course_id: courseData._id || courseData.course_id,
        course_title: courseData.title || courseData.course_name || 'Untitled Course',
        section_id: sectionData._id || sectionData.section_id
      }
    });
    
    // Update XP history with this activity
    await updateXpHistory(userId, xpEarned, 'section_completion', {
      title: sectionData.title || 'Untitled Section',
      id: sectionData._id || sectionData.section_id
    });
    
    return activity;
  } catch (error) {
    console.error('❌ Error recording section completion:', error);
    throw error;
  }
};

/**
 * Record a level up activity
 * 
 * @param {String} userId - User ID
 * @param {Number} newLevel - New level reached
 * @returns {Object} Created activity document
 */
const recordLevelUp = async (userId, newLevel) => {
  try {
    // Create activity record
    const activity = await createActivity({
      user_id: userId,
      type: 'level_up',
      title: `Level ${newLevel}`,
      description: `Reached Level ${newLevel}`,
      xp_earned: 0, // Level ups don't directly award XP
      metadata: {
        level: newLevel
      }
    });
    
    return activity;
  } catch (error) {
    console.error('❌ Error recording level up:', error);
    throw error;
  }
};

/**
 * Get activities for a user
 * 
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of activities to return
 * @param {Number} skip - Number of activities to skip (for pagination)
 * @returns {Array} Array of activity documents
 */
const getUserActivities = async (userId, limit = 20, skip = 0) => {
  try {
    console.log(`🔍 ACTIVITY: Getting activities for user ${userId}`);
    
    const activities = await UserActivity.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`✅ ACTIVITY: Found ${activities.length} activities for user ${userId}`);
    return activities;
  } catch (error) {
    console.error('❌ Error getting user activities:', error);
    throw error;
  }
};

/**
 * Like or unlike an activity
 * 
 * @param {String} activityId - Activity ID
 * @param {String} userId - User ID of the liker
 * @param {String} username - Username of the liker
 * @returns {Object} Updated activity
 */
const toggleLike = async (activityId, userId, username) => {
  try {
    console.log(`🔍 ACTIVITY: Toggling like for activity ${activityId} by user ${userId}`);
    
    // Get the activity
    const activity = await UserActivity.findById(activityId);
    
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Check if the user has already liked the activity
    const existingLike = activity.likes.find(like => like.user_id === userId);
    
    if (existingLike) {
      // Remove the like
      activity.likes = activity.likes.filter(like => like.user_id !== userId);
    } else {
      // Add the like
      activity.likes.push({
        user_id: userId,
        username
      });
    }
    
    await activity.save();
    console.log(`✅ ACTIVITY: ${existingLike ? 'Removed' : 'Added'} like for activity ${activityId} by user ${userId}`);
    
    return activity;
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    throw error;
  }
};

/**
 * Add a comment to an activity
 * 
 * @param {String} activityId - Activity ID
 * @param {String} userId - User ID of the commenter
 * @param {String} username - Username of the commenter
 * @param {String} profilePicture - Profile picture URL of the commenter
 * @param {String} text - Comment text
 * @returns {Object} Updated activity
 */
const addComment = async (activityId, userId, username, profilePicture, text) => {
  try {
    console.log(`🔍 ACTIVITY: Adding comment to activity ${activityId} by user ${userId}`);
    
    // Get the activity
    const activity = await UserActivity.findById(activityId);
    
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Add the comment
    activity.comments.push({
      user_id: userId,
      username,
      profile_picture: profilePicture,
      text
    });
    
    await activity.save();
    console.log(`✅ ACTIVITY: Added comment to activity ${activityId} by user ${userId}`);
    
    return activity;
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw error;
  }
};

/**
 * Get the activity feed for a user (including their own activities and followed users)
 * 
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of activities to return
 * @param {Number} skip - Number of activities to skip (for pagination)
 * @returns {Array} Array of activity documents
 */
const getActivityFeed = async (userId, limit = 20, skip = 0) => {
  try {
    console.log(`🔍 ACTIVITY: Getting activity feed for user ${userId}`);
    
    // Get the user profile to get followed users
    const userProfile = await Profile.findOne({ user_id: userId });
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    // This would include a list of followed users in a real implementation
    // For now, we'll just return the user's own activities
    const activities = await UserActivity.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`✅ ACTIVITY: Found ${activities.length} activities for feed of user ${userId}`);
    return activities;
  } catch (error) {
    console.error('❌ Error getting activity feed:', error);
    throw error;
  }
};

/**
 * Update the XP history with a new data point
 * 
 * @param {String} userId - User ID
 * @param {Number} xpEarned - XP earned
 * @param {String} activityType - Type of activity
 * @param {Object} source - Source of the XP (e.g., course or section details)
 */
const updateXpHistory = async (userId, xpEarned, activityType, source) => {
  try {
    console.log(`📊 XP HISTORY: Updating for user ${userId} with ${xpEarned} XP from ${activityType}`);
    
    // Get user's current profile
    const userProfile = await Profile.findOne({ user_id: userId });
    
    if (!userProfile) {
      console.error(`❌ XP HISTORY: User profile not found for ID: ${userId}`);
      throw new Error('User profile not found');
    }
    
    console.log(`📊 XP HISTORY: Found user profile with totalXP=${userProfile.user_total_exp}, level=${userProfile.level}`);
    
    // Get the current date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get the current week (Sunday to Saturday)
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log(`📊 XP HISTORY: Creating/updating records for periods:`, {
      daily: today.toISOString(),
      weekly: startOfWeek.toISOString(),
      monthly: startOfMonth.toISOString()
    });
    
    // Create or update daily record
    await updateXpHistoryPeriod(userId, userProfile, xpEarned, activityType, source, 'daily', today);
    
    // Create or update weekly record
    await updateXpHistoryPeriod(userId, userProfile, xpEarned, activityType, source, 'weekly', startOfWeek);
    
    // Create or update monthly record
    await updateXpHistoryPeriod(userId, userProfile, xpEarned, activityType, source, 'monthly', startOfMonth);
    
    console.log(`✅ XP HISTORY: Successfully updated all records for user ${userId}`);
  } catch (error) {
    console.error('❌ Error updating XP history:', error);
    throw error;
  }
};

/**
 * Update or create an XP history record for a specific period
 * 
 * @param {String} userId - User ID
 * @param {Object} userProfile - User profile data
 * @param {Number} xpEarned - XP earned
 * @param {String} activityType - Type of activity
 * @param {Object} source - Source of the XP
 * @param {String} period - Period type ('daily', 'weekly', 'monthly')
 * @param {Date} periodDate - Start date of the period
 */
const updateXpHistoryPeriod = async (userId, userProfile, xpEarned, activityType, source, period, periodDate) => {
  try {
    // Find existing record for this period
    let xpHistory = await XpHistory.findOne({
      user_id: userId,
      period,
      date: { $gte: periodDate, $lt: getNextPeriodDate(period, periodDate) }
    });
    
    if (xpHistory) {
      // Update existing record with correct field names from Profile model
      xpHistory.xp = userProfile.user_total_exp;
      xpHistory.level = userProfile.level;
      
      // Add the source to the sources array if XP was earned
      if (xpEarned > 0) {
        xpHistory.sources.push({
          type: activityType,
          amount: xpEarned,
          title: source.title,
          id: source.id
        });
      }
    } else {
      // Create a new record with correct field names from Profile model
      xpHistory = new XpHistory({
        user_id: userId,
        xp: userProfile.user_total_exp,
        level: userProfile.level,
        period,
        date: periodDate,
        sources: xpEarned > 0 ? [{
          type: activityType,
          amount: xpEarned,
          title: source.title,
          id: source.id
        }] : []
      });
    }
    
    await xpHistory.save();
    console.log(`✅ XP HISTORY: Updated ${period} record for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error updating ${period} XP history:`, error);
    throw error;
  }
};

/**
 * Get the start date of the next period
 * 
 * @param {String} period - Period type ('daily', 'weekly', 'monthly')
 * @param {Date} currentPeriodDate - Start date of the current period
 * @returns {Date} Start date of the next period
 */
const getNextPeriodDate = (period, currentPeriodDate) => {
  const next = new Date(currentPeriodDate);
  
  switch (period) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  
  return next;
};

/**
 * Get XP history for a user
 * 
 * @param {String} userId - User ID
 * @param {String} period - Period type ('daily', 'weekly', 'monthly')
 * @param {Number} limit - Maximum number of records to return
 * @returns {Array} Array of XP history records
 */
const getXpHistory = async (userId, period = 'monthly', limit = 12) => {
  try {
    console.log(`📊 XP HISTORY: Getting ${period} history for user ${userId}`);
    
    const xpHistory = await XpHistory.find({ user_id: userId, period })
      .sort({ date: -1 })
      .limit(limit);
    
    console.log(`✅ XP HISTORY: Found ${xpHistory.length} ${period} records for user ${userId}`);
    return xpHistory;
  } catch (error) {
    console.error(`❌ Error getting ${period} XP history:`, error);
    throw error;
  }
};

module.exports = {
  createActivity,
  recordCourseCompletion,
  recordSectionCompletion,
  recordLevelUp,
  getUserActivities,
  toggleLike,
  addComment,
  getActivityFeed,
  updateXpHistory,
  getXpHistory
}; 