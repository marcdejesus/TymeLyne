/**
 * XP and Leveling System Utilities
 */

/**
 * Calculate the XP required to reach a specific level
 * Level 1 requires 0 XP (default level)
 * Level 2 requires 500 XP
 * Each level after increases by 10% (level 3 requires 500 * 1.2, level 4 requires 500 * 1.3, etc.)
 * 
 * @param {Number} level The level to calculate XP for
 * @returns {Number} The XP required to reach this level
 */
const getXpForLevel = (level) => {
  if (level <= 1) return 0;
  const baseXp = 500;
  return Math.round(baseXp * (1 + (level - 2) * 0.1));
};

/**
 * Calculate the total XP required to reach a specific level from level 1
 * 
 * @param {Number} targetLevel The target level
 * @returns {Number} The total cumulative XP required to reach this level from level 1
 */
const getTotalXpForLevel = (targetLevel) => {
  if (targetLevel <= 1) return 0;
  
  let totalXp = 0;
  for (let level = 2; level <= targetLevel; level++) {
    totalXp += getXpForLevel(level);
  }
  return totalXp;
};

/**
 * Calculate the level based on total XP
 * 
 * @param {Number} totalXp The total XP
 * @returns {Object} Object containing the current level and XP progress to next level
 */
const calculateLevelFromXp = (totalXp) => {
  if (totalXp < 500) {
    return {
      level: 1,
      nextLevelXp: 500,
      currentLevelXp: totalXp,
      totalXpForNextLevel: 500
    };
  }
  
  let level = 1;
  let accumulatedXp = 0;
  let currentLevelXp = totalXp;
  
  while (true) {
    const nextLevelXp = getXpForLevel(level + 1);
    if (accumulatedXp + nextLevelXp > totalXp) {
      return {
        level,
        nextLevelXp,
        currentLevelXp: totalXp - accumulatedXp,
        totalXpForNextLevel: nextLevelXp
      };
    }
    
    accumulatedXp += nextLevelXp;
    level++;
    currentLevelXp = totalXp - accumulatedXp;
  }
};

/**
 * Calculate reward XP for completing a course
 * 
 * @param {Object} course The course object
 * @returns {Number} The XP reward for completing the entire course
 */
const calculateCourseCompletionXp = (course) => {
  if (!course || !course.sections || !course.sections.length) return 0;
  return 500 * (100 + course.sections.length);
};

/**
 * Award XP for section/quiz completion
 * 
 * @param {Number} action The action type: 1 = section completion, 2 = quiz completion
 * @returns {Number} The XP amount to award
 */
const getActionXp = (action) => {
  switch (action) {
    case 'quiz_completion':
      return 250;
    case 'section_completion':
      return 100;
    case 'course_completion':
      // This is calculated separately based on number of sections
      return 0;
    default:
      return 0;
  }
};

module.exports = {
  getXpForLevel,
  getTotalXpForLevel,
  calculateLevelFromXp,
  calculateCourseCompletionXp,
  getActionXp
}; 