const express = require('express');
const router = express.Router();
const { sendEmailUnified } = require('../utils/emailProvider');

// In-memory status cache
let lastSendStatus = null;
let lastSendTime = null;
let lastProvider = null;
let lastError = null;

// Patch sendEmailUnified to capture status (monkey patch for demo; for prod, refactor to event/callback)
const origSendEmailUnified = sendEmailUnified;
async function trackedSendEmailUnified(opts) {
  try {
    const result = await origSendEmailUnified(opts);
    lastSendStatus = 'success';
    lastSendTime = new Date();
    lastProvider = result.provider || 'unknown';
    lastError = null;
    return result;
  } catch (err) {
    lastSendStatus = 'fail';
    lastSendTime = new Date();
    lastProvider = 'unknown';
    lastError = err.message;
    throw err;
  }
}
// Replace exported function (for this process only)
require('../utils/emailProvider').sendEmailUnified = trackedSendEmailUnified;

router.get('/health', (req, res) => {
  res.json({
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    enabled: process.env.EMAIL_ENABLED !== 'false',
    lastSendStatus,
    lastSendTime,
    lastProvider,
    lastError
  });
});

module.exports = router;