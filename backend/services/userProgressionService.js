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
    console.log(`🎯 AWARD XP: Awarding XP for ${action}`, { userId, data });
    
    // Get the user profile
    const userProfile = await Profile.findOne({ user_id: userId });
    if (!userProfile) {
      console.error(`❌ AWARD XP: User not found`, { userId });
      throw new Error('User not found');
    }
    
    // Ensure user_total_exp exists and is a number
    if (userProfile.user_total_exp === undefined || userProfile.user_total_exp === null) {
      console.warn(`⚠️ AWARD XP: user_total_exp is undefined for user ${userId}, initializing to 0`);
      userProfile.user_total_exp = 0;
    }
    
    console.log(`👤 AWARD XP: Found user profile`, { 
      userId: userProfile.user_id,
      username: userProfile.username,
      currentXp: userProfile.user_total_exp,
      currentLevel: userProfile.level
    });
    
    // Calculate XP to award based on action type
    let xpToAward = getActionXp(action);
    
    // Special case for course completion
    if (action === 'course_completion' && data.course) {
      xpToAward = calculateCourseCompletionXp(data.course);
      console.log(`🧮 AWARD XP: Calculated course completion XP`, { 
        xpToAward,
        courseSections: data.course.sections?.length,
        formula: `500 + (100 * ${data.course.sections?.length}) = ${xpToAward}`
      });
    } else {
      console.log(`🧮 AWARD XP: Using standard XP for ${action}`, { xpToAward });
    }
    
    // Update the user's XP
    const currentXp = userProfile.user_total_exp || 0;  // Ensure we have a valid starting value
    const newTotalXp = currentXp + xpToAward;
    
    console.log(`💰 AWARD XP: Updating user XP`, { 
      oldTotalXp: currentXp,
      xpToAward,
      newTotalXp
    });
    
    // Calculate the new level based on total XP
    const levelData = calculateLevelFromXp(newTotalXp);
    console.log(`📊 AWARD XP: Calculated level data`, levelData);
    
    // Update the user's level and XP
    const oldLevel = userProfile.level || 1;  // Default to level 1 if not set
    userProfile.user_total_exp = newTotalXp;
    userProfile.level = levelData.level;
    
    // Check if leveled up
    const isLevelUp = levelData.level > oldLevel;
    if (isLevelUp) {
      console.log(`🎖️ AWARD XP: User leveled up!`, {
        oldLevel,
        newLevel: levelData.level,
        levelUp: true
      });
    }
    
    // Save the updated profile
    await userProfile.save();
    console.log(`💾 AWARD XP: Saved user profile with new XP and level`);
    
    // Return the updated user data
    return {
      userId: userProfile.user_id,
      username: userProfile.username,
      xpAwarded: xpToAward,
      totalXp: newTotalXp,
      level: levelData.level,
      xpToNextLevel: levelData.nextLevelXp - levelData.currentLevelXp,
      levelProgress: Math.floor((levelData.currentLevelXp / levelData.totalXpForNextLevel) * 100),
      isLevelUp
    };
  } catch (error) {
    console.error('❌ Error in awardXp:', error);
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
    console.log(`👀 GET PROGRESSION: Fetching progression data for user ${userId}`);
    
    const userProfile = await Profile.findOne({ user_id: userId });
    if (!userProfile) {
      console.error(`❌ GET PROGRESSION: User not found`, { userId });
      throw new Error('User not found');
    }
    
    // Ensure user_total_exp exists and is a number
    if (userProfile.user_total_exp === undefined || userProfile.user_total_exp === null) {
      console.warn(`⚠️ GET PROGRESSION: user_total_exp is undefined for user ${userId}, using 0`);
    }
    
    console.log(`👤 GET PROGRESSION: Found user profile`, { 
      userId: userProfile.user_id,
      username: userProfile.username,
      currentXp: userProfile.user_total_exp,
      currentLevel: userProfile.level,
      hasField: typeof userProfile.user_total_exp !== 'undefined'
    });
    
    // Use 0 as default if user_total_exp is not defined
    const totalXp = userProfile.user_total_exp || 0;
    
    const levelData = calculateLevelFromXp(totalXp);
    console.log(`📊 GET PROGRESSION: Calculated level data`, levelData);
    
    // Create the response data
    const responseData = {
      userId: userProfile.user_id,
      username: userProfile.username,
      totalXp,
      level: levelData.level,
      currentLevelXp: levelData.currentLevelXp,
      totalXpForNextLevel: levelData.totalXpForNextLevel,
      levelProgress: Math.floor((levelData.currentLevelXp / levelData.totalXpForNextLevel) * 100)
    };
    
    console.log(`📤 GET PROGRESSION: Returning progression data`, responseData);
    return responseData;
    
  } catch (error) {
    console.error('❌ Error in getUserProgressionData:', error);
    throw error;
  }
};

module.exports = {
  awardXp,
  isCourseCompleted,
  getUserProgressionData
}; 