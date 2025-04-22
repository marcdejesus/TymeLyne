const mongoose = require('mongoose');
const Profile = require('../models/profile');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB - Docker container internal connection
// This is the connection string used inside the Docker container
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/tymelyne';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const createDemoUser = async () => {
  try {
    // Check if demo user already exists
    let demoUser = await Profile.findOne({ email: 'demo@example.com' });
    
    if (demoUser) {
      console.log('Demo user already exists. Updating...');
      
      // Update the demo user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      demoUser.password = hashedPassword;
      demoUser.is_verified = true; // Ensure the user is verified
      
      await demoUser.save();
      console.log('Demo user updated successfully!');
    } else {
      console.log('Creating new demo user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      // Create new demo user
      const newDemoUser = new Profile({
        user_id: uuidv4(),
        email: 'demo@example.com',
        username: 'demouser',
        password: hashedPassword,
        fName: 'Demo',
        lName: 'User',
        created_at: new Date(),
        is_verified: true, // Demo user should be verified immediately
        bio: 'This is a demo account for testing the Tymelyne application.',
        achievements: [],
        courses: []
      });
      
      await newDemoUser.save();
      console.log('Demo user created successfully!');
    }
    
    // Get and display the demo user
    const user = await Profile.findOne({ email: 'demo@example.com' }).select('-password');
    console.log('Demo User:', user);
    
    console.log('\nDemo Login Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password');
    
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    // Exit process - important in Docker to avoid hanging
    process.exit(0);
  }
};

// Run the function
createDemoUser(); 