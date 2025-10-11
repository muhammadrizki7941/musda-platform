const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment routes
router.post('/qris', paymentController.generateQRIS);
router.get('/account', paymentController.getBankAccount);
router.get('/status/:paymentCode', paymentController.checkPaymentStatus);

module.exports = router;