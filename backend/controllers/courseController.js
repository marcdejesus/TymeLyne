const Course = require('../models/course');
const Profile = require('../models/profile');
const { generateCourse } = require('../services/openai.service');

/**
 * Create a new course using OpenAI
 * @route POST /api/courses/generate
 * @access Private
 */
exports.generateCourse = async (req, res) => {
  try {
    console.log('🔍 Course generation request received:', {
      body: req.body,
      user_id: req.user.id
    });
    
    const { topic, difficulty = 'Beginner', sectionsCount = 3 } = req.body;
    
    if (!topic) {
      console.log('❌ Course generation failed: Topic is required');
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const user_id = req.user.id;
    
    // Check if the user exists
    const profile = await Profile.findOne({ user_id });
    if (!profile) {
      console.log(`❌ Course generation failed: User profile not found for ID ${user_id}`);
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    console.log('👤 User profile found:', {
      user_id: profile.user_id,
      email: profile.email,
      username: profile.username,
      course_generations: profile.course_generations
    });
    
    // Optional: check if user has remaining course generations
    if (profile.course_generations !== undefined && profile.course_generations <= 0) {
      console.log(`⛔ Course generation denied: User ${profile.username} has no generations remaining (current: ${profile.course_generations})`);
      return res.status(403).json({ message: 'No course generations remaining' });
    }
    
    console.log(`✅ Course generation authorized: ${profile.course_generations} generations remaining`);
    
    // Generate course content using OpenAI
    console.log('🤖 Requesting AI course generation for:', {
      topic,
      difficulty,
      sectionsCount
    });
    
    const courseData = await generateCourse(topic, difficulty, sectionsCount);
    
    console.log('✅ AI generation successful:', {
      title: courseData.title,
      sections_count: courseData.sections.length
    });
    
    // Create the course in the database
    const course = new Course({
      title: courseData.title,
      description: courseData.description,
      sections: courseData.sections,
      created_by: user_id,
      difficulty: difficulty,
      is_public: false, // Default to private
      category: topic, // Using topic as initial category
    });
    
    await course.save();
    console.log(`✅ Course saved to database with ID: ${course._id}`);
    
    // Optional: Decrement course generations count
    if (profile.course_generations !== undefined) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { user_id },
        { $inc: { course_generations: -1 } },
        { new: true }
      );
      
      console.log(`✅ Updated course generations for user ${profile.username}:`, {
        previous: profile.course_generations,
        new: updatedProfile.course_generations
      });
    }
    
    res.status(201).json({ 
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('❌ Error in course generation:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all public courses
 * @route GET /api/courses
 * @access Public
 */
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_public: true });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get course by ID
 * @route GET /api/courses/:id
 * @access Public
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // If course is private, check if the requester is the owner
    if (!course.is_public && course.created_by !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get courses created by the logged-in user
 * @route GET /api/courses/user/mycourses
 * @access Private
 */
exports.getUserCourses = async (req, res) => {
  try {
    const courses = await Course.find({ created_by: req.user.id });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a course
 * @route PUT /api/courses/:id
 * @access Private
 */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course creator
    if (course.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update fields
    const { title, description, sections, is_public, category, tags, difficulty } = req.body;
    
    if (title) course.title = title;
    if (description) course.description = description;
    if (sections) course.sections = sections;
    if (is_public !== undefined) course.is_public = is_public;
    if (category) course.category = category;
    if (tags) course.tags = tags;
    if (difficulty) course.difficulty = difficulty;
    
    await course.save();
    
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a course
 * @route DELETE /api/courses/:id
 * @access Private
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course creator
    if (course.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await Course.deleteOne({ course_id: req.params.id });
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a section's completion status
 * @route PATCH /api/courses/:id/sections/:sectionId/complete
 * @access Private
 */
exports.updateSectionCompletion = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { isCompleted } = req.body;
    
    const course = await Course.findOne({ course_id: id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find the section to update
    const section = course.sections.id(sectionId);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Update the section's completion status
    section.isCompleted = isCompleted;
    
    await course.save();
    
    res.json({ message: 'Section completion status updated', section });
  } catch (error) {
    console.error('Error updating section completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 