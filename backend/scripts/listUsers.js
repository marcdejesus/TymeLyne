/**
 * Admin script to list all users with their XP and level
 * Usage: node scripts/listUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/profile');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  listUsers();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function listUsers() {
  try {
    console.log('🔍 Fetching all user profiles...');
    
    // Find all profiles
    const profiles = await Profile.find({}).sort({ username: 1 });
    
    if (profiles.length === 0) {
      console.log('❌ No user profiles found in the database');
      return;
    }
    
    console.log(`\n📋 Found ${profiles.length} user profiles:`);
    console.log('-------------------------------------------------------------------------');
    console.log('| USER ID                 | USERNAME              | XP      | LEVEL     |');
    console.log('-------------------------------------------------------------------------');
    
    profiles.forEach(profile => {
      const userId = (profile.user_id || 'N/A').padEnd(24);
      const username = (profile.username || 'N/A').padEnd(22);
      const xp = (profile.user_total_exp || 0).toString().padEnd(8);
      const level = (profile.level || 1).toString().padEnd(10);
      
      console.log(`| ${userId} | ${username} | ${xp} | ${level} |`);
    });
    
    console.log('-------------------------------------------------------------------------');
    console.log('\n✅ To reset a user\'s XP, use:');
    console.log('  node scripts/resetUserXp.js <user_id> [xp_value]');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
} 