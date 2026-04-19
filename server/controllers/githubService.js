const axios = require('axios');
const { queue } = require('./rateLimiter');

class GitHubService {
  constructor(accessToken) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  // Wrap every API call through the rate limit queue
  _get(url, params = {}) {
    return queue.enqueue(() => this.client.get(url, { params }));
  }

  async getRepositories() {
    const repos = [];
    let page = 1;
    while (true) {
      const { data } = await this._get('/user/repos', {
        per_page: 100, page, sort: 'updated', type: 'all',
      });
      repos.push(...data);
      if (data.length < 100) break;
      page++;
    }
    return repos;
  }

  async getCommitCount(owner, repo) {
    try {
      // Use contributors stats for accurate total count
      const { data } = await this._get(`/repos/${owner}/${repo}/stats/contributors`);
      if (Array.isArray(data)) {
        return data.reduce((sum, c) => sum + (c.total || 0), 0);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getRecentCommits(owner, repo, perPage = 20) {
    try {
      const { data } = await this._get(`/repos/${owner}/${repo}/commits`, {
        per_page: perPage,
      });
      return data.map(c => ({
        sha: c.sha,
        message: c.commit.message.split('\n')[0],
        date: c.commit.author?.date,
        author: c.commit.author?.name,
        additions: 0,
        deletions: 0,
      }));
    } catch {
      return [];
    }
  }

  async getLanguages(owner, repo) {
    try {
      const { data } = await this._get(`/repos/${owner}/${repo}/languages`);
      return data;
    } catch {
      return {};
    }
  }

  async getDeployments(owner, repo) {
    try {
      const { data } = await this._get(`/repos/${owner}/${repo}/deployments`);
      return data.length > 0;
    } catch {
      return false;
    }
  }

  async getRateLimit() {
    try {
      const { data } = await this._get('/rate_limit');
      return data.rate;
    } catch {
      return null;
    }
  }
}

module.exports = GitHubService;
