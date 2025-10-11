const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Create sponsor
router.post('/sponsor', authMiddleware, adminMiddleware, sponsorController.createSponsor);
// Get sponsor by id
router.get('/sponsor/:id', sponsorController.getSponsor);
// List sponsors (optionally by category)
router.get('/sponsors', sponsorController.listSponsors);
// Update sponsor
router.put('/sponsor/:id', authMiddleware, adminMiddleware, sponsorController.updateSponsor);
// Delete sponsor
router.delete('/sponsor/:id', authMiddleware, adminMiddleware, sponsorController.deleteSponsor);

module.exports = router;
