const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const SPHPaymentSettingsModel = require('../models/sphPaymentSettingsModel');

// Get all payment settings (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = await SPHPaymentSettingsModel.getAllSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment settings'
    });
  }
});

// Get settings as object format (Admin only)
router.get('/object', authMiddleware, async (req, res) => {
  try {
    const settings = await SPHPaymentSettingsModel.getSettingsObject();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching payment settings object:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment settings'
    });
  }
});

// Get public pricing info (No auth required)
router.get('/pricing', async (req, res) => {
  try {
    const pricing = await SPHPaymentSettingsModel.getPricingInfo();
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error fetching pricing info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing info'
    });
  }
});

// Get public bank info (No auth required)
router.get('/bank-info', async (req, res) => {
  try {
    const bankInfo = await SPHPaymentSettingsModel.getBankInfo();
    res.json({
      success: true,
      data: bankInfo
    });
  } catch (error) {
    console.error('Error fetching bank info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank info'
    });
  }
});

// Update single setting (Admin only)
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type, description } = req.body;

    if (!value && value !== 0 && value !== false) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    const success = await SPHPaymentSettingsModel.updateSetting(
      key, 
      value, 
      type || 'text', 
      description || ''
    );

    if (success) {
      res.json({
        success: true,
        message: 'Setting updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update setting'
      });
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating setting'
    });
  }
});

// Update multiple settings (Admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Settings must be an array'
      });
    }

    const success = await SPHPaymentSettingsModel.updateMultipleSettings(settings);

    if (success) {
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
});

// Delete setting (Admin only)
router.delete('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const success = await SPHPaymentSettingsModel.deleteSetting(key);

    if (success) {
      res.json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting setting'
    });
  }
});

module.exports = router;