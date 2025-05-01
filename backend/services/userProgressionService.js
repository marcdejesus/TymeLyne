const Profile = require('../models/profile');
const { calculateLevelFromXp, getActionXp, calculateCourseCompletionXp } = require('../utils/xpUtils');

/**
 * Award XP to a user for completing a specific action
 * 
 * @param {String} userId The user's ID
 * @param {String} action The action type: 'quiz_completion', 'section_completion', 'course_completion'
 * @param {Object} data Additional data relevant to the action (e.g., course for course completion)
 * @returns {Object} Updated user data with new XP and level
 */
const awardXp = async (userId, action, data = {}) => {
  try {
    // Get the user profile
    const userProfile = await Profile.findOne({ user_id: userId });
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Calculate XP to award based on action type
    let xpToAward = getActionXp(action);
    
    // Special case for course completion
    if (action === 'course_completion' && data.course) {
      xpToAward = calculateCourseCompletionXp(data.course);
    }
    
    // Update the user's XP
    const newTotalXp = userProfile.user_total_exp + xpToAward;
    
    // Calculate the new level based on total XP
    const levelData = calculateLevelFromXp(newTotalXp);
    
    // Update the user's level and XP
    userProfile.user_total_exp = newTotalXp;
    userProfile.level = levelData.level;
    
    // Save the updated profile
    await userProfile.save();
    
    // Return the updated user data
    return {
      userId: userProfile.user_id,
      username: userProfile.username,
      xpAwarded: xpToAward,
      totalXp: newTotalXp,
      level: levelData.level,
      xpToNextLevel: levelData.nextLevelXp - levelData.currentLevelXp,
      levelProgress: Math.floor((levelData.currentLevelXp / levelData.totalXpForNextLevel) * 100),
      isLevelUp: userProfile.level > (data.previousLevel || 0)
    };
  } catch (error) {
    console.error('Error in awardXp:', error);
    throw error;
  }
};

/**
 * Check if a course is completed based on sections completion status
 * 
 * @param {Object} course The course object
 * @returns {Boolean} Whether the course is fully completed
 */
const isCourseCompleted = (course) => {
  if (!course || !course.sections || course.sections.length === 0) {
    return false;
  }
  
  return course.sections.every(section => section.isCompleted);
};

/**
 * Get current user progression data
 * 
 * @param {String} userId The user's ID
 * @returns {Object} User progression data
 */
const getUserProgressionData = async (userId) => {
  try {
    const userProfile = await Profile.findOne({ user_id: userId });
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    const levelData = calculateLevelFromXp(userProfile.user_total_exp);
    
    return {
      userId: userProfile.user_id,
      username: userProfile.username,
      totalXp: userProfile.user_total_exp,
      level: levelData.level,
      xpToNextLevel: levelData.nextLevelXp - levelData.currentLevelXp,
      levelProgress: Math.floor((levelData.currentLevelXp / levelData.totalXpForNextLevel) * 100)
    };
  } catch (error) {
    console.error('Error in getUserProgressionData:', error);
    throw error;
  }
};

module.exports = {
  awardXp,
  isCourseCompleted,
  getUserProgressionData
}; 