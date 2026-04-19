const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Planet = require('../models/Planet');
const GitHubService = require('../controllers/githubService');

const verifySignature = (req, secret) => {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(req.body));
  const expected = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
};

/**
 * POST /webhooks/github
 *
 * Set this as your GitHub App/webhook URL.
 * Listens for push events and updates the relevant planet's commit count + recent commits.
 *
 * Setup:
 *  1. Go to your GitHub repo → Settings → Webhooks → Add webhook
 *  2. Payload URL: https://yourdomain.com/webhooks/github
 *  3. Content type: application/json
 *  4. Secret: same as WEBHOOK_SECRET in your .env
 *  5. Events: Just the push event
 */
router.post('/github', express.json({ type: '*/*' }), async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && !verifySignature(req, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  if (event !== 'push') {
    return res.status(200).json({ message: `Event ${event} ignored` });
  }

  const { repository, pusher, commits } = req.body;
  if (!repository || !pusher) return res.status(200).json({ message: 'No data' });

  try {
    // Find which user owns this repo in our DB
    const user = await User.findOne({ username: pusher.name });
    if (!user) return res.status(200).json({ message: 'User not tracked' });

    const planet = await Planet.findOne({
      userId: user._id,
      githubRepoId: repository.id,
    });

    if (!planet) return res.status(200).json({ message: 'Planet not found' });

    // Update commit count and prepend new commits
    const newCommits = (commits || []).slice(0, 10).map(c => ({
      sha: c.id,
      message: c.message.split('\n')[0],
      date: new Date(c.timestamp),
      additions: 0,
      deletions: 0,
    }));

    const updatedCommits = [
      ...newCommits,
      ...(planet.recentCommits || []),
    ].slice(0, 20);

    // Re-fetch commit count from GitHub for accuracy
    const gh = new GitHubService(user.accessToken);
    const [owner, repo] = repository.full_name.split('/');
    const recentCommits = await gh.getRecentCommits(owner, repo, 10);

    // Recalculate planet size
    const newCount = planet.commitCount + (commits?.length || 0);
    const newSize = 8 + Math.sqrt(newCount / Math.max(newCount, 1)) * 32;

    await Planet.findByIdAndUpdate(planet._id, {
      commitCount: newCount,
      planetSize: Math.min(newSize, 40),
      recentCommits: recentCommits.length > 0 ? recentCommits : updatedCommits,
      pushedAt: new Date(repository.pushed_at),
    });

    console.log(`🌍 Planet updated: ${planet.name} (+${commits?.length || 0} commits)`);
    res.status(200).json({ message: 'Planet updated', planet: planet.name });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
