const Redis = require('ioredis');

// Use REDIS_URL when provided (e.g. Render), otherwise fall back to local Redis
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1
});

let isReady = false;

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('ready', () => {
    isReady = true;
    console.log('Redis is ready to accept commands');
});

redis.on('error', (err) => {
    isReady = false;
    console.warn(`Redis connection error (fallback to memory active): ${err.message}`);
});

redis.on('close', () => {
    isReady = false;
    console.log('Redis connection closed');
});

module.exports = {
    redis,
    get isReady() {
        return isReady;
    }
};
