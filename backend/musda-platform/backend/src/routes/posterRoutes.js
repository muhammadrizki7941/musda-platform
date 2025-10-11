const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', posterController.getActivePosters);
router.get('/:id', posterController.getPosterById);

// Protected admin routes
router.get('/admin/all', authMiddleware, posterController.getAllPostersAdmin);
router.get('/admin/stats', authMiddleware, posterController.getPosterStats);
router.post('/admin/upload-image', authMiddleware, posterController.getUploadMiddleware(), posterController.uploadImage);
router.post('/admin/create', authMiddleware, posterController.createPoster);
router.put('/admin/:id', authMiddleware, posterController.getUploadMiddleware(), posterController.updatePoster);
router.delete('/admin/:id', authMiddleware, posterController.deletePoster);
router.patch('/admin/:id/toggle-status', authMiddleware, posterController.togglePosterStatus);

module.exports = router;