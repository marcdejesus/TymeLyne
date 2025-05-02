/**
 * Setup script to populate random XP data for testing leaderboards
 * Usage: node scripts/setupLeaderboardData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/profile');
const { calculateLevelFromXp } = require('../utils/xpUtils');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  updateProfileXP();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function updateProfileXP() {
  try {
    console.log('🔍 Looking for profiles to update with XP data...');
    
    // Find all profiles
    const profiles = await Profile.find({});
    
    console.log(`Found ${profiles.length} profiles to update`);
    
    let updatedCount = 0;
    
    // Update each profile with random XP
    for (const profile of profiles) {
      console.log(`Processing profile: ${profile.username} (${profile.user_id})`);
      
      // Generate a random XP value between 100 and 10,000
      const randomXP = Math.floor(Math.random() * 9900) + 100;
      
      // Calculate level based on XP to ensure consistency
      const levelData = calculateLevelFromXp(randomXP);
      
      // Store original values for logging
      const oldXP = profile.user_total_exp || 0;
      const oldLevel = profile.level || 1;
      
      // Update profile with new XP and level
      profile.user_total_exp = randomXP;
      profile.level = levelData.level;
      
      // Save the updated profile
      await profile.save();
      
      console.log(`  ✓ Profile updated: XP ${oldXP} → ${randomXP}, Level ${oldLevel} → ${levelData.level}`);
      updatedCount++;
    }
    
    console.log(`\n✅ Updated ${updatedCount} profiles with random XP data`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
} 