const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', galleryController.getGalleryItems);

// Admin routes (protected) - put specific routes before parameterized ones
router.get('/admin/all', authMiddleware, adminMiddleware, galleryController.getGalleryItemsForAdmin);
router.post('/admin/create', authMiddleware, adminMiddleware, galleryController.createGalleryItem);
router.post('/admin/sort-order', authMiddleware, adminMiddleware, galleryController.updateSortOrder);
router.post('/admin/upload-image', 
  authMiddleware, 
  adminMiddleware, 
  galleryController.getUploadMiddleware(), 
  galleryController.uploadImage
);

// Parameterized routes (put after specific routes)
router.get('/:id', galleryController.getGalleryItemById);
router.put('/:id', authMiddleware, adminMiddleware, galleryController.updateGalleryItem);
router.delete('/:id', authMiddleware, adminMiddleware, galleryController.deleteGalleryItem);

module.exports = router;