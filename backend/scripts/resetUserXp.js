/**
 * Admin script to reset a user's XP and level
 * Usage: node scripts/resetUserXp.js <user_id> [xp_value]
 * If xp_value is not provided, it defaults to 0
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/profile');
const { calculateLevelFromXp } = require('../utils/xpUtils');

// Process arguments
const userId = process.argv[2];
const newXpValue = process.argv[3] ? parseInt(process.argv[3], 10) : 0;

if (!userId) {
  console.error('❌ Please provide a user ID as an argument');
  console.log('Usage: node scripts/resetUserXp.js <user_id> [xp_value]');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  resetUserXp();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function resetUserXp() {
  try {
    console.log(`🔍 Looking for user with ID: ${userId}`);
    
    // Find the user profile
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      console.error(`❌ User not found with ID: ${userId}`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${profile.username} (${profile.user_id})`);
    console.log(`Current XP: ${profile.user_total_exp || 0}, Current Level: ${profile.level || 1}`);
    
    // Calculate new level based on XP
    const levelData = calculateLevelFromXp(newXpValue);
    
    // Update the profile
    const oldXp = profile.user_total_exp;
    const oldLevel = profile.level;
    
    profile.user_total_exp = newXpValue;
    profile.level = levelData.level;
    
    await profile.save();
    
    console.log(`\n✅ Successfully reset user's XP and level:`);
    console.log(`  XP: ${oldXp || 0} → ${newXpValue}`);
    console.log(`  Level: ${oldLevel || 1} → ${levelData.level}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
} 