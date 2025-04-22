/**
 * Script to manually verify a user's email
 * Usage: node verifyUser.js user@example.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Profile model
const Profile = require('../models/profile');

// Function to verify a user
async function verifyUser(email) {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Find user by email
    const user = await Profile.findOne({ email });
    
    if (!user) {
      console.error(`🔴 User with email ${email} not found`);
      process.exit(1);
    }

    // Check if user is already verified
    if (user.is_verified) {
      console.log(`ℹ️ User ${user.username} (${user.email}) is already verified`);
      process.exit(0);
    }

    // Update user verification status
    user.is_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await user.save();

    console.log(`✅ User ${user.username} (${user.email}) is now verified`);
    process.exit(0);
  } catch (error) {
    console.error('🔴 Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('🔴 Please provide an email address');
  console.log('Usage: node verifyUser.js user@example.com');
  process.exit(1);
}

verifyUser(email); 