/**
 * Script to find and fix Profile documents with missing user_total_exp field
 * 
 * Run with: node scripts/fixProfileXp.js
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
  run();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Fix profiles
async function run() {
  try {
    console.log('🔎 Looking for profiles with missing user_total_exp field...');
    
    // Find profiles with missing fields or invalid values
    const profiles = await Profile.find({
      $or: [
        { user_total_exp: { $exists: false } },
        { user_total_exp: null },
        { level: { $exists: false } },
        { level: null }
      ]
    });
    
    console.log(`Found ${profiles.length} profiles with missing XP fields`);
    
    let updatedCount = 0;
    
    // Update each profile
    for (const profile of profiles) {
      console.log(`Processing profile: ${profile.username} (${profile.user_id})`);
      
      // Set default values if missing
      if (profile.user_total_exp === undefined || profile.user_total_exp === null) {
        profile.user_total_exp = 0;
        console.log(`  - Set user_total_exp to 0`);
      }
      
      if (profile.level === undefined || profile.level === null) {
        profile.level = 1;
        console.log(`  - Set level to 1`);
      }
      
      // Calculate level based on XP to ensure consistency
      const levelData = calculateLevelFromXp(profile.user_total_exp);
      
      // Check if level is incorrect
      if (profile.level !== levelData.level) {
        console.log(`  - Fixed incorrect level: ${profile.level} → ${levelData.level}`);
        profile.level = levelData.level;
      }
      
      // Save the updated profile
      await profile.save();
      updatedCount++;
      console.log(`  ✓ Profile updated successfully`);
    }
    
    console.log(`\n✅ Updated ${updatedCount} profiles successfully`);
    
    // Also check for profiles with level but no XP (calculated from level)
    const levelProfiles = await Profile.find({
      level: { $gt: 1 },
      user_total_exp: { $in: [0, null, undefined] }
    });
    
    if (levelProfiles.length > 0) {
      console.log(`\n🔎 Found ${levelProfiles.length} profiles with level > 1 but no XP`);
      
      for (const profile of levelProfiles) {
        console.log(`Processing profile: ${profile.username} (${profile.user_id})`);
        
        // Calculate minimum XP needed for this level
        const minXpForLevel = (profile.level - 1) * 500; // Simple approximation
        profile.user_total_exp = minXpForLevel;
        
        await profile.save();
        console.log(`  ✓ Set XP to ${minXpForLevel} for level ${profile.level}`);
      }
      
      console.log(`\n✅ Fixed ${levelProfiles.length} profiles with missing XP`);
    }
    
    console.log('\n🎉 All profiles fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
} 