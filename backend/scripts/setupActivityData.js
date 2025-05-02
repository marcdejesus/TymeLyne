/**
 * Setup script to populate sample activity data for testing
 * Usage: node scripts/setupActivityData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const UserActivity = require('../models/userActivity');
const XpHistory = require('../models/xpHistory');
const Profile = require('../models/profile');
const Course = require('../models/course');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  setupActivityData();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function setupActivityData() {
  try {
    console.log('🔍 Looking for user profiles...');
    
    // Find all profiles
    const profiles = await Profile.find({});
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please run the setupLeaderboardData.js script first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${profiles.length} profiles.`);
    
    // Get courses
    const courses = await Course.find({});
    
    if (courses.length === 0) {
      console.log('⚠️ No courses found. Using mock course data.');
    } else {
      console.log(`✅ Found ${courses.length} courses.`);
    }
    
    // Create mock course data if needed
    const mockCourses = [
      {
        _id: mongoose.Types.ObjectId(),
        title: 'JavaScript Fundamentals',
        sections: [
          { _id: mongoose.Types.ObjectId(), title: 'Introduction to JavaScript' },
          { _id: mongoose.Types.ObjectId(), title: 'Variables and Data Types' },
          { _id: mongoose.Types.ObjectId(), title: 'Functions and Scope' }
        ]
      },
      {
        _id: mongoose.Types.ObjectId(),
        title: 'React Basics',
        sections: [
          { _id: mongoose.Types.ObjectId(), title: 'Getting Started with React' },
          { _id: mongoose.Types.ObjectId(), title: 'Components and Props' },
          { _id: mongoose.Types.ObjectId(), title: 'State and Lifecycle' }
        ]
      }
    ];
    
    // Array to store all activities
    const activities = [];
    const xpHistoryEntries = [];
    
    // Generate activity data for each profile
    for (const profile of profiles) {
      console.log(`📝 Generating activity data for user ${profile.username || profile.user_id}`);
      
      // Create level up activities
      const level = profile.level || 1;
      for (let i = 2; i <= level; i++) {
        activities.push({
          user_id: profile.user_id,
          type: 'level_up',
          title: `Level ${i}`,
          description: `Reached Level ${i}`,
          created_at: new Date(Date.now() - (level - i + 1) * 86400000 * 7), // Older levels happened further in the past
          metadata: {
            level: i
          }
        });
      }
      
      // Create course completion activities
      const coursesToUse = courses.length > 0 ? courses : mockCourses;
      
      // Complete between 0-2 courses for each user
      const completedCoursesCount = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < completedCoursesCount && i < coursesToUse.length; i++) {
        const course = coursesToUse[i];
        const xpEarned = Math.floor(Math.random() * 300) + 200;
        
        activities.push({
          user_id: profile.user_id,
          type: 'course_completion',
          title: course.title || course.course_name || 'Untitled Course',
          description: `Completed the ${course.title || course.course_name || 'Untitled Course'} course`,
          xp_earned: xpEarned,
          created_at: new Date(Date.now() - (i + 1) * 86400000 * 3), // Each course completed a few days apart
          metadata: {
            course_id: course._id || course.course_id,
            sections_count: course.sections?.length || 0
          }
        });
        
        // Create section completion activities for each section in the course
        if (course.sections && course.sections.length > 0) {
          for (let j = 0; j < course.sections.length; j++) {
            const section = course.sections[j];
            const sectionXp = Math.floor(Math.random() * 100) + 50;
            
            activities.push({
              user_id: profile.user_id,
              type: 'section_completion',
              title: section.title || 'Untitled Section',
              description: `Completed ${section.title || 'Untitled Section'} in ${course.title || course.course_name || 'Untitled Course'}`,
              xp_earned: sectionXp,
              created_at: new Date(Date.now() - (i + 1) * 86400000 * 3 - (j + 1) * 3600000), // Each section completed a few hours apart
              metadata: {
                course_id: course._id || course.course_id,
                course_title: course.title || course.course_name || 'Untitled Course',
                section_id: section._id || section.section_id
              }
            });
          }
        }
      }
      
      // Create XP history data
      // Generate monthly data for the past year
      const now = new Date();
      let baseXp = 0;
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        
        // Randomly increase XP each month (more in recent months)
        const xpIncrease = Math.floor(Math.random() * 300) + 200 + (11 - i) * 50;
        baseXp += xpIncrease;
        
        // Only create history if we have XP
        if (baseXp > 0) {
          xpHistoryEntries.push({
            user_id: profile.user_id,
            xp: baseXp,
            level: Math.floor(Math.log(baseXp / 100) / Math.log(1.5)) + 1,
            date,
            period: 'monthly',
            sources: []
          });
        }
      }
    }
    
    // Save all activities
    if (activities.length > 0) {
      // Clear existing activities first
      await UserActivity.deleteMany({});
      await UserActivity.insertMany(activities);
      console.log(`✅ Created ${activities.length} activity records.`);
    }
    
    // Save all XP history entries
    if (xpHistoryEntries.length > 0) {
      // Clear existing XP history entries first
      await XpHistory.deleteMany({});
      await XpHistory.insertMany(xpHistoryEntries);
      console.log(`✅ Created ${xpHistoryEntries.length} XP history records.`);
    }
    
    // Add random likes and comments to activities
    await addLikesAndComments(profiles, activities);
    
    console.log('✅ Sample activity data setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up activity data:', error);
    process.exit(1);
  }
}

async function addLikesAndComments(profiles, activities) {
  try {
    console.log('💬 Adding likes and comments to activities...');
    
    const comments = [
      'Great job!',
      'Well done!',
      'Impressive progress!',
      'Keep it up!',
      'Awesome work!',
      'You\'re killing it!',
      'Nice achievement!',
      'That\'s the way to go!',
      'Congratulations!',
      'I\'m also learning this!',
      'How did you find this course?',
      'Was it difficult?',
      'I\'m inspired!',
      'This is motivating me to study too',
      'What\'s next on your learning journey?'
    ];
    
    let likeCount = 0;
    let commentCount = 0;
    
    // For each activity
    for (const activity of activities) {
      // Skip some activities randomly
      if (Math.random() < 0.3) continue;
      
      const activityDoc = await UserActivity.findOne({
        user_id: activity.user_id,
        type: activity.type,
        title: activity.title
      });
      
      if (!activityDoc) continue;
      
      // Add random likes (between 0-5)
      const likeCount = Math.floor(Math.random() * 6);
      
      for (let i = 0; i < likeCount; i++) {
        // Pick a random profile
        const liker = profiles[Math.floor(Math.random() * profiles.length)];
        
        // Don't let users like their own activity
        if (liker.user_id === activity.user_id) continue;
        
        // Add the like if it doesn't already exist
        const existingLike = activityDoc.likes.find(like => like.user_id === liker.user_id);
        
        if (!existingLike) {
          activityDoc.likes.push({
            user_id: liker.user_id,
            username: liker.username || `User${liker.user_id.slice(-4)}`
          });
          likeCount++;
        }
      }
      
      // Add random comments (between 0-3)
      const commentCount = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < commentCount; i++) {
        // Pick a random profile
        const commenter = profiles[Math.floor(Math.random() * profiles.length)];
        
        // Pick a random comment
        const commentText = comments[Math.floor(Math.random() * comments.length)];
        
        // Add the comment
        activityDoc.comments.push({
          user_id: commenter.user_id,
          username: commenter.username || `User${commenter.user_id.slice(-4)}`,
          text: commentText,
          created_at: new Date(activityDoc.created_at.getTime() + Math.floor(Math.random() * 86400000)) // Within a day of the activity
        });
        commentCount++;
      }
      
      // Save the activity document
      await activityDoc.save();
    }
    
    console.log(`✅ Added ${likeCount} likes and ${commentCount} comments to activities.`);
  } catch (error) {
    console.error('❌ Error adding likes and comments:', error);
  }
} 