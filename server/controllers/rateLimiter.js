/**
 * GitHub API rate limit: 5000 requests/hour for authenticated users.
 * This queue ensures we never hit it by spacing requests 80ms apart
 * and retrying with exponential backoff on 403/429 responses.
 */
class RateLimitQueue {
  constructor(intervalMs = 80) {
    this.queue = [];
    this.running = false;
    this.intervalMs = intervalMs;
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.running) this._run();
    });
  }

  async _run() {
    this.running = true;
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      try {
        const result = await this._withRetry(fn);
        resolve(result);
      } catch (err) {
        reject(err);
      }
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, this.intervalMs));
      }
    }
    this.running = false;
  }

  async _withRetry(fn, attempts = 3, delay = 1000) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        const status = err?.response?.status;
        if ((status === 403 || status === 429) && i < attempts - 1) {
          const retryAfter = parseInt(err?.response?.headers?.['retry-after'] || '0');
          const wait = retryAfter > 0 ? retryAfter * 1000 : delay * Math.pow(2, i);
          console.warn(`⏳ Rate limited. Retrying in ${wait}ms...`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        throw err;
      }
    }
  }
}

// Shared queue instance — one per server process
const queue = new RateLimitQueue(80);

module.exports = { queue };
