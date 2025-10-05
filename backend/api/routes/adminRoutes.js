const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminMiddleware, authMiddleware } = require('../middleware/authMiddleware');


// List all admins
router.get('/admins', authMiddleware, adminMiddleware, adminController.listAdmins);
// Create admin
router.post('/admins', authMiddleware, adminMiddleware, adminController.createAdmin);
// Update admin
router.put('/admins/:id', authMiddleware, adminMiddleware, adminController.updateAdmin);
// Delete admin
router.delete('/admins/:id', authMiddleware, adminMiddleware, adminController.deleteAdmin);
// List activities
router.get('/admins/activities', authMiddleware, adminMiddleware, adminController.listActivities);

module.exports = router;
