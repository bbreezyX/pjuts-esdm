import { Redis } from "@upstash/redis";

/**
 * Upstash Redis Client
 * 
 * Used for distributed rate limiting that works across
 * serverless function invocations and multiple instances.
 * 
 * Required environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

// Lazy-initialized Redis client (prevents build-time errors when env vars are not set)
let redisInstance: Redis | null = null;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

/**
 * Get the Redis client instance.
 * Returns null if Redis is not configured (graceful degradation).
 */
export function getRedis(): Redis | null {
  const config = getRedisConfig();
  
  if (!config) {
    return null;
  }

  if (!redisInstance) {
    redisInstance = new Redis({
      url: config.url,
      token: config.token,
    });
  }

  return redisInstance;
}

/**
 * Check if Redis is configured and available
 */
export function isRedisConfigured(): boolean {
  return getRedisConfig() !== null;
}
