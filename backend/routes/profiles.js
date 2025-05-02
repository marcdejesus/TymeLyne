const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const userProgressionService = require('../services/userProgressionService');

// === Progression Routes (must be before the /:id wildcard route) ===

/**
 * @route   GET /api/profiles/progression
 * @desc    Get user progression data (level, XP, etc.)
 * @access  Private
 */
router.get('/progression', protect, profileController.getUserProgressionData);

// === Current User Routes ===

// @route   GET /api/profiles/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, profileController.getCurrentProfile);

// @route   PUT /api/profiles/update
// @desc    Update current user profile
// @access  Private
router.put('/update', protect, profileController.updateProfile);

// @route   PUT /api/profiles/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, profileController.changePassword);

// @route   POST /api/profiles/upload-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-picture', protect, profileController.uploadProfilePicture);

// === Courses Management Routes ===

// @route   POST /api/profiles/courses
// @desc    Add a course to user's current_courses
// @access  Private
router.post('/courses', protect, profileController.addCurrentCourse);

// @route   DELETE /api/profiles/courses/:courseId
// @desc    Remove a course from user's current_courses
// @access  Private
router.delete('/courses/:courseId', protect, profileController.removeCurrentCourse);

// === Wildcard Profile Routes (must be after specific routes) ===

// @route   GET /api/profiles/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   PUT /api/profiles/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, profileController.updateProfile);

module.exports = router; 