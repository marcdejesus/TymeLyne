const Profile = require('../models/profile');

// Get user profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findOne({ user_id: id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      username, fName, lName, bio, dob, profile_picture, theme 
    } = req.body;
    
    // Make sure user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    // Check if username is already taken if it's being updated
    if (username) {
      const existingUser = await Profile.findOne({ 
        username, 
        user_id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }
    
    // Only update fields that are provided
    const updateFields = {};
    if (username) updateFields.username = username;
    if (fName) updateFields.fName = fName;
    if (lName) updateFields.lName = lName;
    if (bio !== undefined) updateFields.bio = bio;
    if (dob) updateFields.dob = new Date(dob);
    if (profile_picture) updateFields.profile_picture = profile_picture;
    if (theme) updateFields.theme = theme;
    
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: req.user.id },
      { $set: updateFields },
      { new: true }
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 