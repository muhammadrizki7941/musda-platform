// countdownRoutes.js
const express = require('express');
const router = express.Router();
const { getCountdown, setCountdown } = require('../controllers/countdownController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', getCountdown);
router.post('/', authMiddleware, adminMiddleware, setCountdown);

module.exports = router;
