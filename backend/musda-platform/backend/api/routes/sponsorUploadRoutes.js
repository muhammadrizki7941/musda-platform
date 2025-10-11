const express = require('express');
const router = express.Router();
const sponsorUploadController = require('../controllers/sponsorUploadController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/sponsor/upload-logo', authMiddleware, adminMiddleware, sponsorUploadController.uploadLogo);

module.exports = router;
