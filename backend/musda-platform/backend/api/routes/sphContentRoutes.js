const express = require('express');
const router = express.Router();
const SphContentController = require('../controllers/sphContentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes (for frontend)
router.get('/frontend', SphContentController.getFrontendContent);

// Protected admin routes
router.get('/admin/sections', authMiddleware, SphContentController.getSections);
router.get('/admin/section/:section', authMiddleware, SphContentController.getContentBySection);
router.get('/admin/:id', authMiddleware, SphContentController.getContentById);
router.post('/admin', authMiddleware, SphContentController.createContent);
router.put('/admin/:id', authMiddleware, SphContentController.updateContent);
router.delete('/admin/:id', authMiddleware, SphContentController.deleteContent);
router.put('/admin/section/:section/bulk', authMiddleware, SphContentController.bulkUpdateSection);

module.exports = router;