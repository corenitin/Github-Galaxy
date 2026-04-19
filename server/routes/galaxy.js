const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Planet = require('../models/Planet');
const User = require('../models/User');
const GitHubService = require('../controllers/githubService');
const { assignGalaxyPositions, getPlanetType } = require('../controllers/galaxyBuilder');

// GET /api/galaxy - get current user's galaxy
router.get('/', requireAuth, async (req, res) => {
  try {
    const planets = await Planet.find({ userId: req.user._id }).lean();
    const user = await User.findById(req.user._id).select('-accessToken');
    res.json({
      user,
      planets,
      galaxyName: user.galaxyName,
      lastSynced: user.lastSynced,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/galaxy/sync - sync repos from GitHub
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gh = new GitHubService(user.accessToken);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    send({ type: 'start', message: 'Connecting to GitHub...' });

    const repos = await gh.getRepositories();
    send({ type: 'progress', message: `Found ${repos.length} repositories`, total: repos.length });

    let processed = 0;
    const repoData = [];

    for (const repo of repos) {
      try {
        send({ type: 'progress', message: `Processing ${repo.name}...`, current: processed + 1, total: repos.length });

        const [languages, hasDeployment, recentCommits] = await Promise.all([
          gh.getLanguages(repo.owner.login, repo.name),
          gh.getDeployments(repo.owner.login, repo.name),
          gh.getRecentCommits(repo.owner.login, repo.name, 10),
        ]);

        repoData.push({
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          languages,
          commitCount: recentCommits.length > 0 ? Math.max(repo.size / 10, recentCommits.length) : 0,
          starCount: repo.stargazers_count,
          forkCount: repo.forks_count,
          size: repo.size,
          isPrivate: repo.private,
          isFork: repo.fork,
          isArchived: repo.archived,
          hasDeployment,
          homepage: repo.homepage,
          topics: repo.topics || [],
          recentCommits,
          createdAt: new Date(repo.created_at),
          pushedAt: new Date(repo.pushed_at),
        });
      } catch (e) {
        // Skip repos with errors
      }
      processed++;
    }

    // Assign galaxy positions
    const planetsWithPositions = assignGalaxyPositions(repoData);

    // Upsert planets
    let totalCommits = 0;
    for (const p of planetsWithPositions) {
      const existing = await Planet.findOne({ userId: user._id, githubRepoId: p.githubRepoId });
      totalCommits += p.commitCount || 0;

      if (existing) {
        // Keep orbital positions stable — only update data
        await Planet.findByIdAndUpdate(existing._id, {
          ...p,
          orbitRadius: existing.orbitRadius,
          orbitAngle: existing.orbitAngle,
          orbitSpeed: existing.orbitSpeed,
          userId: user._id,
        });
      } else {
        await Planet.create({ ...p, userId: user._id });
      }
    }

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      lastSynced: new Date(),
      totalCommits,
      totalRepos: planetsWithPositions.length,
    });

    send({ type: 'complete', message: 'Galaxy synced!', count: planetsWithPositions.length });
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

// GET /api/galaxy/planet/:id - single planet details
router.get('/planet/:id', requireAuth, async (req, res) => {
  try {
    const planet = await Planet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    res.json({ planet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/galaxy/public/:username - view someone else's public galaxy
router.get('/public/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-accessToken -email');
    if (!user) return res.status(404).json({ error: 'Galaxy not found' });
    const planets = await Planet.find({ userId: user._id, isPrivate: false }).lean();
    res.json({ user, planets, galaxyName: user.galaxyName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
