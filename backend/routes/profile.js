const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const userProgressionService = require('../services/userProgressionService');

// Get current user profile
router.get('/me', protect, profileController.getCurrentProfile);

// Update user profile
router.put('/update', protect, profileController.updateProfile);

// Change user password
router.put('/change-password', protect, profileController.changePassword);

// Upload profile picture
router.post('/upload-picture', protect, profileController.uploadProfilePicture);

/**
 * @route   GET /api/profile/progression
 * @desc    Get user progression data (level, XP, etc.)
 * @access  Private
 */
router.get('/progression', protect, async (req, res) => {
  try {
    const progressionData = await userProgressionService.getUserProgressionData(req.user.id);
    res.json(progressionData);
  } catch (error) {
    console.error('Error fetching user progression:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 