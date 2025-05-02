const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const UserActivitySchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['course_completion', 'section_completion', 'level_up', 'quiz_completion', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  xp_earned: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  likes: {
    type: [{
      user_id: String,
      username: String,
      created_at: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  comments: {
    type: [CommentSchema],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create indexes for common queries
UserActivitySchema.index({ user_id: 1, created_at: -1 });
UserActivitySchema.index({ type: 1, created_at: -1 });

module.exports = mongoose.model('UserActivity', UserActivitySchema); 