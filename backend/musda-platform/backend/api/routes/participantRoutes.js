const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', participantController.register);
router.get('/:id', participantController.getById);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, participantController.list);
router.put('/:id', authMiddleware, adminMiddleware, participantController.update);
router.delete('/:id', authMiddleware, adminMiddleware, participantController.delete);
router.post('/:id/confirm', authMiddleware, adminMiddleware, participantController.confirmPayment);

module.exports = router;