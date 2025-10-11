const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { dbPromise } = require('../utils/db');

// Get system settings
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await dbPromise.execute(`
      SELECT setting_key, setting_value, description 
      FROM system_settings 
      ORDER BY setting_key
    `);
    
    // Convert to key-value object
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description
      };
    });
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system settings',
      error: error.message
    });
  }
});

// Update system settings
router.put('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
  const { settings } = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      await dbPromise.execute(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at) 
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value), 
        updated_at = VALUES(updated_at)
      `, [key, value]);
    }
    
    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: error.message
    });
  }
});

// Get application info
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const appInfo = {
      name: 'MUSDA HIMPERRA Admin Dashboard',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DB_NAME || 'musda1',
      serverTime: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    res.json({
      success: true,
      data: appInfo
    });
  } catch (error) {
    console.error('Error fetching app info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application info',
      error: error.message
    });
  }
});

module.exports = router;