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
    maxlength: 254
  },
  username: {
    type: String,
    required: true,
    maxlength: 30
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String
  },
  verification_token_expires: {
    type: Date
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
    maxlength: 50
  },
  lName: {
    type: String,
    maxlength: 50
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
  level: {
    type: Number,
    default: 1
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
    maxlength: 10,
    default: 'light'
  },
  password: {
    type: String,
    required: true,
    select: false
  }
});

module.exports = mongoose.model('Profile', ProfileSchema); 