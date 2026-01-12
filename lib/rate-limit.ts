/**
 * Distributed Rate Limiter for Authentication
 * 
 * Provides protection against brute-force attacks on login endpoints.
 * Uses Upstash Redis for distributed rate limiting that works across
 * serverless function invocations and multiple instances.
 * 
 * Falls back to in-memory rate limiting if Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisConfigured } from "./redis";

// ============================================
// TYPES
// ============================================

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,        // 15 minutes
  maxAttempts: 5,                   // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000,  // 30 minutes block after exceeded
};

// ============================================
// UPSTASH RATE LIMITER
// ============================================

let loginRateLimiter: Ratelimit | null = null;

function getLoginRateLimiter(): Ratelimit | null {
  if (loginRateLimiter) return loginRateLimiter;
  
  const redis = getRedis();
  if (!redis) return null;
  
  loginRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(DEFAULT_CONFIG.maxAttempts, "15 m"),
    prefix: "ratelimit:login",
    analytics: true,
  });
  
  return loginRateLimiter;
}

// ============================================
// IN-MEMORY FALLBACK (for development/local)
// ============================================

interface InMemoryEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const inMemoryStore = new Map<string, InMemoryEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupInMemory() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, entry] of inMemoryStore.entries()) {
    if (now > entry.resetAt && (!entry.blockedUntil || now > entry.blockedUntil)) {
      inMemoryStore.delete(key);
    }
  }
  lastCleanup = now;
}

function checkInMemoryRateLimit(key: string): RateLimitResult {
  cleanupInMemory();
  
  const { windowMs, maxAttempts, blockDurationMs } = DEFAULT_CONFIG;
  const now = Date.now();
  let entry = inMemoryStore.get(key);

  // Check if currently blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  // Check if over limit
  if (entry.count >= maxAttempts) {
    entry.blockedUntil = now + blockDurationMs;
    inMemoryStore.set(key, entry);

    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds: Math.ceil(blockDurationMs / 1000),
    };
  }

  return {
    success: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

function incrementInMemoryRateLimit(key: string): void {
  cleanupInMemory();
  
  const { windowMs } = DEFAULT_CONFIG;
  const now = Date.now();
  let entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
  } else {
    entry.count++;
  }

  inMemoryStore.set(key, entry);
}

function resetInMemoryRateLimit(key: string): void {
  inMemoryStore.delete(key);
}

// ============================================
// PUBLIC API (Async)
// ============================================

/**
 * Check if a key is rate limited (async)
 * Uses Redis if available, falls back to in-memory
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const rateLimiter = getLoginRateLimiter();
  
  // Use Upstash if available
  if (rateLimiter) {
    const result = await rateLimiter.limit(key);
    
    return {
      success: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
      retryAfterSeconds: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  }
  
  // Fallback to in-memory
  if (!isRedisConfigured()) {
    console.warn("[Rate Limit] Redis not configured, using in-memory fallback");
  }
  return checkInMemoryRateLimit(key);
}

/**
 * Increment the rate limit counter for a key (async)
 * Note: With Upstash, this is handled automatically by checkRateLimit
 * This is mainly for the in-memory fallback
 */
export async function incrementRateLimit(key: string): Promise<void> {
  const rateLimiter = getLoginRateLimiter();
  
  // Upstash handles this in the limit() call, but we still increment for tracking
  if (rateLimiter) {
    // For Upstash, the increment happens in checkRateLimit
    // We call limit again to increment the counter
    await rateLimiter.limit(key);
    return;
  }
  
  // Fallback to in-memory
  incrementInMemoryRateLimit(key);
}

/**
 * Reset rate limit for a key (async)
 * Call after successful login
 */
export async function resetRateLimit(key: string): Promise<void> {
  const redis = getRedis();
  
  if (redis) {
    // Delete all keys with this prefix from Upstash
    await redis.del(`ratelimit:login:${key}`);
    return;
  }
  
  // Fallback to in-memory
  resetInMemoryRateLimit(key);
}

/**
 * Generate a rate limit key for login attempts
 */
export function getLoginRateLimitKey(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate a rate limit key for IP-based limiting
 */
export function getIpRateLimitKey(ip: string): string {
  return `ip:${ip}`;
}

// ============================================
// LEGACY SYNC API (for backward compatibility)
// These will be removed in future versions
// ============================================

/**
 * @deprecated Use async checkRateLimit instead
 */
export function checkRateLimitSync(key: string): RateLimitResult {
  return checkInMemoryRateLimit(key);
}

/**
 * @deprecated Use async incrementRateLimit instead
 */
export function incrementRateLimitSync(key: string): void {
  incrementInMemoryRateLimit(key);
}

/**
 * @deprecated Use async resetRateLimit instead
 */
export function resetRateLimitSync(key: string): void {
  resetInMemoryRateLimit(key);
}
