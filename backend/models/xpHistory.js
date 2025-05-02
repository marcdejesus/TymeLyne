const mongoose = require('mongoose');
const { Schema } = mongoose;

const XpHistorySchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  xp: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Store the time period this entry represents (daily, weekly, monthly)
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  // Optional fields to provide context for the XP snapshot
  sources: [{
    type: {
      type: String,
      enum: ['course_completion', 'section_completion', 'quiz_completion', 'achievement'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    title: String,
    id: String
  }]
});

// Create compound index for user_id and period and date
XpHistorySchema.index({ user_id: 1, period: 1, date: -1 });

module.exports = mongoose.model('XpHistory', XpHistorySchema); 