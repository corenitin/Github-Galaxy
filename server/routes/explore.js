const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Planet = require('../models/Planet');

// GET /api/explore - discover recently active galaxies
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const users = await User.find({ lastSynced: { $exists: true } })
      .sort({ lastSynced: -1 })
      .skip(skip)
      .limit(limit)
      .select('-accessToken -email')
      .lean();

    const galaxies = await Promise.all(users.map(async (user) => {
      const planetCount = await Planet.countDocuments({ userId: user._id, isPrivate: false });
      const topPlanets = await Planet.find({ userId: user._id, isPrivate: false })
        .sort({ commitCount: -1 })
        .limit(3)
        .select('name language planetColor commitCount planetSize')
        .lean();
      return {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        galaxyName: user.galaxyName,
        totalRepos: user.totalRepos,
        totalCommits: user.totalCommits,
        lastSynced: user.lastSynced,
        planetCount,
        topPlanets,
      };
    }));

    const total = await User.countDocuments({ lastSynced: { $exists: true } });

    res.json({
      galaxies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/explore/leaderboard - top galaxies by commit count
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ totalCommits: { $gt: 0 } })
      .sort({ totalCommits: -1 })
      .limit(20)
      .select('-accessToken -email')
      .lean();

    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
