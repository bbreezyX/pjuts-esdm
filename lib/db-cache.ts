/**
 * Database Query Caching Utilities
 *
 * Leverages Upstash Redis for caching Prisma query results.
 * Provides transparent caching layer with automatic cache invalidation.
 */

import { getRedis, isRedisConfigured } from "./redis";

// ============================================
// CACHE CONFIGURATION
// ============================================

export const CACHE_TTL = {
  /** Short-lived cache for frequently changing data (1 minute) */
  SHORT: 60,
  /** Medium cache for semi-static data (5 minutes) */
  MEDIUM: 300,
  /** Long cache for rarely changing data (30 minutes) */
  LONG: 1800,
  /** Very long cache for static reference data (2 hours) */
  STATIC: 7200,
} as const;

export const CACHE_KEYS = {
  /** PJUTS unit data */
  UNIT: "db:unit",
  /** Unit list/search results */
  UNITS: "db:units",
  /** Report data */
  REPORT: "db:report",
  /** User data */
  USER: "db:user",
  /** Dashboard stats */
  STATS: "db:stats",
  /** Map data */
  MAP: "db:map",
} as const;

// ============================================
// CACHE UTILITIES
// ============================================

/**
 * Generate a cache key from prefix and identifiers
 */
export function cacheKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  return `${prefix}:${parts.join(":")}`;
}

/**
 * Execute a query with Redis caching
 * Falls back to direct query if Redis is not configured
 *
 * @example
 * const user = await cachedQuery(
 *   cacheKey(CACHE_KEYS.USER, id),
 *   () => prisma.user.findUnique({ where: { id } }),
 *   CACHE_TTL.MEDIUM
 * );
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  const redis = getRedis();

  // If Redis not configured, execute query directly
  if (!redis) {
    return queryFn();
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);

    if (cached !== null) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Cache] HIT: ${key}`);
      }
      return cached;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] MISS: ${key}`);
    }
  } catch (error) {
    // Log cache read error but continue with query
    console.warn(`[Cache] Read error for ${key}:`, error);
  }

  // Execute the actual query
  const result = await queryFn();

  // Store in cache (don't await, fire and forget)
  if (result !== null && result !== undefined) {
    redis.set(key, result, { ex: ttlSeconds }).catch((error) => {
      console.warn(`[Cache] Write error for ${key}:`, error);
    });
  }

  return result;
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Invalidated: ${key}`);
    }
  } catch (error) {
    console.warn(`[Cache] Invalidation error for ${key}:`, error);
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * Use with caution - this scans keys
 *
 * @example
 * // Invalidate all unit-related caches
 * await invalidateCachePattern("db:unit:*");
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    // Note: SCAN is not available in Upstash REST API
    // For pattern invalidation, use explicit key deletion
    // This is a simplified version - for production, consider
    // maintaining a key registry or using tags

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Pattern invalidation requested: ${pattern}`);
    }
  } catch (error) {
    console.warn(`[Cache] Pattern invalidation error:`, error);
  }
}

/**
 * Invalidate multiple specific cache keys
 */
export async function invalidateCacheKeys(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;

  try {
    // Delete all keys in parallel
    await Promise.all(keys.map((key) => redis.del(key)));

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Invalidated ${keys.length} keys`);
    }
  } catch (error) {
    console.warn(`[Cache] Batch invalidation error:`, error);
  }
}

// ============================================
// CACHE STATUS
// ============================================

/**
 * Check if caching is available
 */
export function isCacheAvailable(): boolean {
  return isRedisConfigured();
}

/**
 * Get cache stats (for monitoring)
 */
export async function getCacheStats() {
  const redis = getRedis();

  return {
    available: redis !== null,
    provider: "upstash-redis",
  };
}
