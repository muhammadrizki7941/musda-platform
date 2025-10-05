const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/register', authController.register); // hanya untuk admin, tambahkan middleware di route utama

module.exports = router;
