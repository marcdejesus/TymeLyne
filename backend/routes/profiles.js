const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// @route   GET /api/profiles/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   PUT /api/profiles/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, profileController.updateProfile);

module.exports = router; 