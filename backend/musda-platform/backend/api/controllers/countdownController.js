// countdownController.js
const { getCountdown, setCountdown } = require('../models/countdownModel');
const User = require('../models/User');

exports.getCountdown = async (req, res) => {
  try {
    const countdown = await getCountdown();
    res.json(countdown);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countdown' });
  }
};

exports.setCountdown = async (req, res) => {
  try {
    const { targetDate } = req.body;
    if (!targetDate) return res.status(400).json({ error: 'targetDate required' });
    await setCountdown(targetDate);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set countdown' });
  }
};
