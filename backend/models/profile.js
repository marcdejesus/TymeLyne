const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfileSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 254
  },
  username: {
    type: String,
    required: true,
    max: 30
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  profile_picture: {
    type: String,
    default: ''
  },
  fName: {
    type: String,
    max: 50
  },
  lName: {
    type: String,
    max: 50
  },
  bio: {
    type: String
  },
  dob: {
    type: Date
  },
  user_total_exp: {
    type: Number,
    default: 0
  },
  follower_count: {
    type: Number,
    default: 0
  },
  friends_count: {
    type: Number,
    default: 0
  },
  current_courses: {
    type: [Schema.Types.Mixed],
    default: []
  },
  completed_courses: {
    type: [Schema.Types.Mixed],
    default: []
  },
  theme: {
    type: String,
    max: 10,
    default: 'light'
  },
  course_generations: {
    type: Number,
    default: 0
  },
  password: {
    type: String,
    required: true,
    select: false
  }
});

module.exports = mongoose.model('Profile', ProfileSchema); 