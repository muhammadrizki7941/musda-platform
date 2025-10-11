const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { dbPromise } = require('../utils/db');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Remove sensitive information
    const profile = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email } = req.body;
    
    await dbPromise.execute(
      'UPDATE users SET nama = ?, email = ? WHERE id = ?',
      [nama, email, userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;