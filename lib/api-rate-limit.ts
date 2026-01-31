/**
 * API Rate Limiter
 * 
 * Provides rate limiting for API endpoints to prevent abuse.
 * Uses Upstash Redis for distributed rate limiting that works
 * across serverless function invocations.
 * 
 * Falls back to in-memory rate limiting if Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisConfigured } from "./redis";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
  /** Requests allowed per window */
  requests: number;
  /** Window duration (e.g., "1 m", "10 s", "1 h") */
  window: string;
  /** Prefix for rate limit keys */
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// ============================================
// RATE LIMIT CONFIGURATIONS
// ============================================

/**
 * Rate limit tiers for different API endpoints
 */
export const RATE_LIMIT_TIERS = {
  /** Standard API endpoints - 60 requests per minute */
  STANDARD: {
    requests: 60,
    window: "1 m",
    prefix: "ratelimit:api:standard",
  },
  /** Sensitive endpoints (reports, units CRUD) - 30 requests per minute */
  SENSITIVE: {
    requests: 30,
    window: "1 m",
    prefix: "ratelimit:api:sensitive",
  },
  /** Heavy endpoints (exports, bulk operations) - 10 requests per minute */
  HEAVY: {
    requests: 10,
    window: "1 m",
    prefix: "ratelimit:api:heavy",
  },
  /** Upload endpoints - 20 requests per minute */
  UPLOAD: {
    requests: 20,
    window: "1 m",
    prefix: "ratelimit:api:upload",
  },
  /** Search/query endpoints - 100 requests per minute */
  SEARCH: {
    requests: 100,
    window: "1 m",
    prefix: "ratelimit:api:search",
  },
} as const;

// ============================================
// RATE LIMITER INSTANCES
// ============================================

const rateLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter instance for a given config
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${config.prefix}:${config.requests}:${config.window}`;
  
  if (!rateLimiters.has(key)) {
    // Parse window string (e.g., "1 m", "10 s", "1 h")
    const [amount, unit] = config.window.split(" ");
    const windowStr = `${amount} ${unit}` as `${number} ${"ms" | "s" | "m" | "h" | "d"}`;
    
    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, windowStr),
        prefix: config.prefix,
        analytics: true,
      })
    );
  }

  return rateLimiters.get(key) || null;
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, InMemoryEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

function cleanupInMemory() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, entry] of inMemoryStore.entries()) {
    if (now > entry.resetAt) {
      inMemoryStore.delete(key);
    }
  }
  lastCleanup = now;
}

function parseWindowToMs(window: string): number {
  const [amount, unit] = window.split(" ");
  const num = parseInt(amount, 10);
  
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      return num * 60 * 1000; // Default to minutes
  }
}

function checkInMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupInMemory();
  
  const now = Date.now();
  const windowMs = parseWindowToMs(config.window);
  let entry = inMemoryStore.get(key);

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  // Increment counter
  entry.count++;
  inMemoryStore.set(key, entry);

  const remaining = Math.max(0, config.requests - entry.count);
  const success = entry.count <= config.requests;

  return {
    success,
    limit: config.requests,
    remaining,
    reset: entry.resetAt,
  };
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Check rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (usually IP or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkApiRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD
): Promise<RateLimitResult> {
  const rateLimiter = getRateLimiter(config);

  if (rateLimiter) {
    const result = await rateLimiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Fallback to in-memory
  if (!isRedisConfigured()) {
    console.warn("[API Rate Limit] Redis not configured, using in-memory fallback");
  }
  
  return checkInMemoryRateLimit(`${config.prefix}:${identifier}`, config);
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try various headers for real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP if multiple
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Vercel-specific header
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0].trim();
  }

  // Fallback to a default (should rarely happen)
  return "unknown";
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());
  return headers;
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
  
  return NextResponse.json(
    {
      error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      code: "RATE_LIMITED",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

/**
 * Rate limit middleware for API routes
 * 
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await withApiRateLimit(request, RATE_LIMIT_TIERS.STANDARD);
 *   if (!rateLimitResult.success) {
 *     return createRateLimitResponse(rateLimitResult);
 *   }
 *   // ... handle request
 * }
 * ```
 */
export async function withApiRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  return checkApiRateLimit(identifier, config);
}

/**
 * Apply rate limit to response headers
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  return response;
}
