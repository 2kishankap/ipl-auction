const Redis = require('ioredis');

// Connect to default local Redis
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
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
