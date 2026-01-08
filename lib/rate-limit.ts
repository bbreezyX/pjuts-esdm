/**
 * In-Memory Rate Limiter for Authentication
 * 
 * Provides protection against brute-force attacks on login endpoints.
 * Uses a sliding window algorithm with automatic cleanup.
 * 
 * For production at scale, consider using Redis-based rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
    blockedUntil?: number;
}

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxAttempts: number;   // Max attempts per window
    blockDurationMs: number; // Block duration after max attempts exceeded
}

// Default configuration for login rate limiting
const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 15 * 60 * 1000,      // 15 minutes
    maxAttempts: 5,                 // 5 attempts per window
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block after exceeded
};

// In-memory store for rate limiting
// Key format: "login:email@example.com" or "login:ip:192.168.1.1"
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    for (const [key, entry] of rateLimitStore.entries()) {
        // Remove entries that have both expired their window and block
        if (now > entry.resetAt && (!entry.blockedUntil || now > entry.blockedUntil)) {
            rateLimitStore.delete(key);
        }
    }
    lastCleanup = now;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
    blockedUntil?: number;
    retryAfterSeconds?: number;
}

/**
 * Check if a key is rate limited
 */
export function checkRateLimit(
    key: string,
    config: Partial<RateLimitConfig> = {}
): RateLimitResult {
    cleanup();

    const { windowMs, maxAttempts, blockDurationMs } = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
        const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            blockedUntil: entry.blockedUntil,
            retryAfterSeconds,
        };
    }

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
        entry = {
            count: 0,
            resetAt: now + windowMs,
        };
    }

    // Check if over limit
    if (entry.count >= maxAttempts) {
        entry.blockedUntil = now + blockDurationMs;
        rateLimitStore.set(key, entry);

        const retryAfterSeconds = Math.ceil(blockDurationMs / 1000);
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            blockedUntil: entry.blockedUntil,
            retryAfterSeconds,
        };
    }

    return {
        success: true,
        remaining: maxAttempts - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Increment the rate limit counter for a key
 * Call this after a failed login attempt
 */
export function incrementRateLimit(
    key: string,
    config: Partial<RateLimitConfig> = {}
): void {
    cleanup();

    const { windowMs } = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        entry = {
            count: 1,
            resetAt: now + windowMs,
        };
    } else {
        entry.count++;
    }

    rateLimitStore.set(key, entry);
}

/**
 * Reset rate limit for a key (call after successful login)
 */
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

/**
 * Generate a rate limit key for login attempts
 */
export function getLoginRateLimitKey(email: string): string {
    // Normalize email to lowercase
    return `login:${email.toLowerCase().trim()}`;
}

/**
 * Generate a rate limit key for IP-based limiting
 */
export function getIpRateLimitKey(ip: string): string {
    return `ip:${ip}`;
}
