const Course = require('../models/course');
const Profile = require('../models/profile');
const { generateCourse } = require('../services/openai.service');
const userProgressionService = require('../services/userProgressionService');

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
      username: profile.username
    });
    
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
    const courseId = req.params.id;
    let course;
    
    // Try to find by MongoDB ObjectId first (handle if the id is a valid MongoDB ObjectId)
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Looking for course by _id: ${courseId}`);
      course = await Course.findById(courseId);
    }
    
    // If not found by _id, try to find by course_id (which is a number)
    if (!course && !isNaN(Number(courseId))) {
      console.log(`Looking for course by course_id: ${courseId}`);
      course = await Course.findOne({ course_id: Number(courseId) });
    }
    
    if (!course) {
      console.log(`Course not found with id: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // If course is private, check if the requester is the owner
    if (!course.is_public && course.created_by !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }
    
    console.log(`Course found: ${course.title}, with ${course.sections.length} sections`);
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get courses created by the logged-in user
 * @route GET /api/courses/user/courses
 * @access Private
 */
exports.getUserCourses = async (req, res) => {
  try {
    // First, find all courses created by the user
    const createdCourses = await Course.find({ created_by: req.user.id });
    
    // Then, get the user's profile to fetch current_courses
    const userProfile = await Profile.findOne({ user_id: req.user.id });
    
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    // Get the course ids from the current_courses array
    const currentCourseIds = userProfile.current_courses || [];
    
    // If there are current courses, fetch their details
    let enrolledCourses = [];
    if (currentCourseIds.length > 0) {
      // Convert any string ids or non-numeric ids to appropriate format
      const courseIds = currentCourseIds.map(id => {
        // If id is a number or can be parsed as a number, return it
        return isNaN(Number(id)) ? id : Number(id);
      });
      
      // Fetch courses based on whether ids are numeric or not
      const numericIds = courseIds.filter(id => !isNaN(Number(id)));
      const nonNumericIds = courseIds.filter(id => isNaN(Number(id)));
      
      // Find courses with course_id in numericIds or _id in nonNumericIds
      if (numericIds.length > 0) {
        const numericCourses = await Course.find({ course_id: { $in: numericIds } });
        enrolledCourses = [...enrolledCourses, ...numericCourses];
      }
      
      if (nonNumericIds.length > 0) {
        const nonNumericCourses = await Course.find({ _id: { $in: nonNumericIds } });
        enrolledCourses = [...enrolledCourses, ...nonNumericCourses];
      }
    }
    
    // Combine the lists, removing duplicates
    const allCourses = [...createdCourses];
    
    // Add enrolled courses that aren't already in the created courses list
    enrolledCourses.forEach(enrolledCourse => {
      const isDuplicate = createdCourses.some(
        createdCourse => String(createdCourse._id) === String(enrolledCourse._id)
      );
      
      if (!isDuplicate) {
        allCourses.push(enrolledCourse);
      }
    });
    
    res.json(allCourses);
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
 * @route POST /api/courses/:courseId/section/:sectionId/complete
 * @access Private
 */
exports.updateSectionCompletion = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { isCompleted } = req.body;
    
    console.log(`Updating section completion: courseId=${courseId}, sectionId=${sectionId}, isCompleted=${isCompleted}`);
    
    let course;
    
    // Try to find by MongoDB ObjectId first
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Looking for course by _id: ${courseId}`);
      course = await Course.findById(courseId);
    }
    
    // If not found by _id, try to find by course_id
    if (!course && !isNaN(Number(courseId))) {
      console.log(`Looking for course by course_id: ${courseId}`);
      course = await Course.findOne({ course_id: Number(courseId) });
    }
    
    if (!course) {
      console.log(`Course not found with id: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find the section to update - could be by _id or by a custom id field
    const section = course.sections.id(sectionId) || 
                    course.sections.find(s => s.id && s.id.toString() === sectionId.toString());
    
    if (!section) {
      console.log(`Section not found with id: ${sectionId}`);
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if status is changing to completed
    const becomingCompleted = !section.isCompleted && isCompleted;
    
    // Get the user profile to access current level before update
    const userProfile = await Profile.findOne({ user_id: req.user.id });
    if (!userProfile) {
      console.log(`❌ User profile not found for ID: ${req.user.id}`);
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    console.log(`✅ Found user profile for completion:`, {
      id: userProfile._id,
      userId: userProfile.user_id,
      username: userProfile.username,
      currentXP: userProfile.user_total_exp,
      level: userProfile.level,
      modelFields: Object.keys(userProfile._doc)
    });
    
    const previousLevel = userProfile.level;
    
    // Update the section's completion status
    section.isCompleted = isCompleted;
    await course.save();
    
    // Award XP if the section is being marked as completed
    let progressData = null;
    if (becomingCompleted) {
      console.log(`Section is becoming completed, awarding XP to user: ${req.user.id}`);
      console.log(`User profile before XP award:`, {
        userId: userProfile.user_id,
        currentXP: userProfile.user_total_exp,
        currentLevel: userProfile.level
      });
      
      // Award XP for section completion only once, regardless of quiz presence
      try {
        // Award XP for section completion (250 XP)
        progressData = await userProgressionService.awardXp(req.user.id, 'section_completion', { previousLevel });
        console.log(`✅ Section completion XP awarded: ${progressData.xpAwarded} XP`, {
          xpAwarded: progressData.xpAwarded,
          newTotalXp: progressData.totalXp,
          newLevel: progressData.level,
          userId: req.user.id
        });
      } catch (xpError) {
        console.error(`❌ Error awarding section completion XP:`, xpError);
      }
      
      // Check if the entire course is now completed
      const isFullCourseCompleted = userProgressionService.isCourseCompleted(course);
      console.log(`Course completion check:`, {
        isFullCourseCompleted,
        totalSections: course.sections.length,
        completedSections: course.sections.filter(s => s.isCompleted).length
      });
      
      if (isFullCourseCompleted) {
        try {
          console.log(`Course is fully completed, awarding course completion XP`);
          // Award XP for completing the entire course
          progressData = await userProgressionService.awardXp(req.user.id, 'course_completion', { 
            course, 
            previousLevel: progressData?.level || previousLevel 
          });
          console.log(`✅ Course completion XP awarded: ${progressData.xpAwarded} XP`, {
            xpAwarded: progressData.xpAwarded,
            newTotalXp: progressData.totalXp,
            newLevel: progressData.level,
            userId: req.user.id,
            courseSections: course.sections.length
          });
        } catch (xpError) {
          console.error(`❌ Error awarding course completion XP:`, xpError);
        }
      }
      
      // Double check profile was updated
      const updatedProfile = await Profile.findOne({ user_id: req.user.id });
      console.log(`User profile after XP awards:`, {
        userId: updatedProfile.user_id,
        currentXP: updatedProfile.user_total_exp,
        currentLevel: updatedProfile.level
      });
    }
    
    console.log(`Section completion updated successfully: ${section.title} isCompleted=${isCompleted}`);
    res.json({ 
      message: 'Section completion status updated', 
      section,
      progressData: progressData || await userProgressionService.getUserProgressionData(req.user.id)
    });
  } catch (error) {
    console.error('Error updating section completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 