const Profile = require('../models/profile');
const Course = require('../models/course');
const userProgressionService = require('../services/userProgressionService');

/**
 * Get current user profile
 * @route GET /api/profile/me
 * @access Private
 */
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Change user password
 * @route PUT /api/profile/change-password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // This would normally verify the current password and hash the new one
    // But is a placeholder for now
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Upload profile picture
 * @route POST /api/profile/upload-picture
 * @access Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    // This would normally handle file upload
    // But is a placeholder for now
    res.json({ message: 'Profile picture uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user profile
 * @route GET /api/profiles/:id
 * @access Public
 */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.params.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile
 * @route PUT /api/profiles
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    // Find profile by user_id (from auth middleware)
    const profile = await Profile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Fields that can be updated
    const { fName, lName, bio, dob, profile_picture, theme } = req.body;
    
    // Update fields if provided
    if (fName) profile.fName = fName;
    if (lName) profile.lName = lName;
    if (bio) profile.bio = bio;
    if (dob) profile.dob = dob;
    if (profile_picture) profile.profile_picture = profile_picture;
    if (theme) profile.theme = theme;
    
    await profile.save();
    
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add a course to current_courses
 * @route POST /api/profiles/courses
 * @access Private
 */
exports.addCurrentCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    // Verify the course exists
    const course = await Course.findOne({
      $or: [
        { _id: courseId },
        { course_id: Number(courseId) }
      ]
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find and update the user's profile
    const profile = await Profile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Format the course ID consistently
    const courseIdToAdd = course.course_id || course._id;
    
    // Check if course is already in current_courses
    if (profile.current_courses && profile.current_courses.some(id => 
      String(id) === String(courseIdToAdd)
    )) {
      return res.status(400).json({ message: 'Course already in your current courses' });
    }
    
    // Add the course ID to current_courses
    profile.current_courses = profile.current_courses || [];
    profile.current_courses.push(courseIdToAdd);
    
    await profile.save();
    
    res.status(200).json({ 
      message: 'Course added to current courses',
      current_courses: profile.current_courses
    });
  } catch (error) {
    console.error('Error adding course to profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Remove a course from current_courses
 * @route DELETE /api/profiles/courses/:courseId
 * @access Private
 */
exports.removeCurrentCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Find the user's profile
    const profile = await Profile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Check if current_courses exists and has the course
    if (!profile.current_courses || !profile.current_courses.some(id => 
      String(id) === String(courseId)
    )) {
      return res.status(400).json({ message: 'Course not found in your current courses' });
    }
    
    // Remove the course ID from current_courses
    profile.current_courses = profile.current_courses.filter(id => 
      String(id) !== String(courseId)
    );
    
    await profile.save();
    
    res.status(200).json({ 
      message: 'Course removed from current courses',
      current_courses: profile.current_courses
    });
  } catch (error) {
    console.error('Error removing course from profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user progression data (XP, level)
 * @route GET /api/profiles/progression
 * @access Private
 */
exports.getUserProgressionData = async (req, res) => {
  try {
    console.log('👤 CONTROLLER: Fetching progression data for user', req.user.id);
    const progressionData = await userProgressionService.getUserProgressionData(req.user.id);
    res.json(progressionData);
  } catch (error) {
    console.error('❌ Error fetching user progression data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 