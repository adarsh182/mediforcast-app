import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

const memoryCache = new Map();

let redisClient = null;
let redisReady = false;

if (redisUrl) {
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message);
  });
  redisClient.connect()
    .then(() => {
      redisReady = true;
    })
    .catch((error) => {
      console.error('Redis connection failed, falling back to memory cache:', error.message);
      redisClient = null;
      redisReady = false;
    });
}

function makeKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

export async function getCache(prefix, params) {
  const key = makeKey(prefix, params);

  if (redisClient && redisReady) {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  }

  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

export async function setCache(prefix, params, value, ttlSeconds = 300) {
  const key = makeKey(prefix, params);

  if (redisClient && redisReady) {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
