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
    console.log('⚠️ Request to remove course with ID:', courseId, 'type:', typeof courseId);

    // Special case handling for "How Beer Is Made" course 
    // (temporary workaround to debug the issue)
    const isBeerCourse = courseId === 'How is Beer Made' || 
                         courseId === 'How Beer Is Made' || 
                         String(courseId).toLowerCase().includes('beer');
    
    if (isBeerCourse) {
      console.log('👋 Special case: Attempting to remove beer course');
    }
    
    // Find the user's profile
    const profile = await Profile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      console.log('❌ Profile not found');
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Special handling for the beer course
    if (isBeerCourse) {
      // Try to find the course by name in course titles
      const Course = require('../models/course');
      const beerCourses = await Course.find({
        $or: [
          { title: { $regex: /beer/i } },
          { course_name: { $regex: /beer/i } }
        ]
      });
      
      console.log('🍺 Found beer courses:', beerCourses.map(c => ({
        id: c._id,
        course_id: c.course_id,
        title: c.title || c.course_name
      })));
      
      if (beerCourses.length > 0) {
        // Try to remove each of these beer courses
        let removed = false;
        for (const beerCourse of beerCourses) {
          const beerCourseId = beerCourse._id || beerCourse.course_id;
          console.log(`🍺 Attempting to remove beer course with ID: ${beerCourseId}`);
          
          // Check if this ID exists in current_courses
          const beerExists = profile.current_courses.some(id => 
            String(id) === String(beerCourseId)
          );
          
          if (beerExists) {
            console.log(`🍺 Beer course found! Removing ${beerCourseId}`);
            profile.current_courses = profile.current_courses.filter(id => 
              String(id) !== String(beerCourseId)
            );
            removed = true;
          }
        }
        
        if (removed) {
          await profile.save();
          
          console.log('✅ Beer course removed successfully');
          
          return res.status(200).json({ 
            message: 'Beer course removed from current courses',
            current_courses: profile.current_courses
          });
        }
      }
    }
    
    // Log current courses for debugging
    console.log('👀 Current courses in profile:', profile.current_courses);
    
    // Ensure current_courses exists
    if (!profile.current_courses || !profile.current_courses.length) {
      console.log('❌ No current courses found in profile');
      return res.status(400).json({ message: 'Course not found in your current courses' });
    }
    
    // Try to find the course by comparing different formats
    let courseExists = false;
    let matchedId = null;
    
    // Check all possible formats (string, number, ObjectId)
    profile.current_courses.forEach(id => {
      // Check various formats
      const checks = [
        String(id) === String(courseId),
        id === courseId,
        // Try to handle MongoDB ObjectIDs specifically
        (id.toString && id.toString() === courseId),
        (id.valueOf && id.valueOf() === courseId),
        // Try parsing as numbers if possible
        (!isNaN(id) && !isNaN(courseId) && Number(id) === Number(courseId)),
        // Try checking ObjectID toString vs original ID toString
        (id.toString && courseId.toString && id.toString() === courseId.toString())
      ];
      
      if (checks.some(check => check === true)) {
        courseExists = true;
        matchedId = id;
      }
    });
    
    console.log('🔍 Course exists check result:', {courseExists, matchedId});
    
    if (!courseExists) {
      return res.status(400).json({ message: 'Course not found in your current courses' });
    }
    
    // Remove the course ID from current_courses - using the matched ID format if found
    if (matchedId) {
      profile.current_courses = profile.current_courses.filter(id => 
        String(id) !== String(matchedId)
      );
    } else {
      // Fallback to string comparison
      profile.current_courses = profile.current_courses.filter(id => 
        String(id) !== String(courseId)
      );
    }
    
    await profile.save();
    
    console.log('✅ Course removed successfully');
    
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