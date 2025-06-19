const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const SectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  hasQuiz: {
    type: Boolean,
    default: true
  },
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }],
    default: []
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const CourseSchema = new Schema({
  course_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sections: [SectionSchema],
  created_by: {
    type: Schema.Types.String,
    ref: 'Profile',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  is_public: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  ai_logo: {
    type: String,
    default: null
  }
});

// Add auto-incremented course_id field
CourseSchema.plugin(AutoIncrement, {inc_field: 'course_id'});

module.exports = mongoose.model('Course', CourseSchema); 