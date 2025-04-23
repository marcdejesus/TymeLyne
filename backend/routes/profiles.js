const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// @route   GET /api/profiles/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   PUT /api/profiles/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, profileController.updateProfile);

// @route   POST /api/profiles/courses
// @desc    Add a course to user's current_courses
// @access  Private
router.post('/courses', protect, profileController.addCurrentCourse);

// @route   DELETE /api/profiles/courses/:courseId
// @desc    Remove a course from user's current_courses
// @access  Private
router.delete('/courses/:courseId', protect, profileController.removeCurrentCourse);

module.exports = router; 