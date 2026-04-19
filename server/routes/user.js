const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-accessToken');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/galaxy-name
router.put('/galaxy-name', requireAuth, async (req, res) => {
  try {
    const { galaxyName } = req.body;
    if (!galaxyName || galaxyName.trim().length < 3) {
      return res.status(400).json({ error: 'Galaxy name must be at least 3 characters' });
    }
    await User.findByIdAndUpdate(req.user._id, { galaxyName: galaxyName.trim() });
    res.json({ message: 'Galaxy name updated', galaxyName: galaxyName.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
