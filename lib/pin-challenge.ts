import { getRedis, isRedisConfigured } from "./redis";
import crypto from "crypto";

const PIN_LENGTH = 6;
const PIN_EXPIRY_SECONDS = 120; // 2 minutes
const MAX_PIN_ATTEMPTS = 3;
const VERIFY_RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_VERIFY_ATTEMPTS_PER_WINDOW = 5; // Max verification attempts per IP/email combo

// In-memory fallback - use global to persist across hot reloads in development
const globalForPinStore = globalThis as unknown as {
  pinChallengeStore: Map<string, { pin: string; attempts: number; expiresAt: number; sessionToken: string }> | undefined;
  verifyRateLimit: Map<string, { count: number; expiresAt: number }> | undefined;
};

const memoryStore = globalForPinStore.pinChallengeStore ?? new Map<string, { pin: string; attempts: number; expiresAt: number; sessionToken: string }>();
globalForPinStore.pinChallengeStore = memoryStore;

const verifyRateLimitStore = globalForPinStore.verifyRateLimit ?? new Map<string, { count: number; expiresAt: number }>();
globalForPinStore.verifyRateLimit = verifyRateLimitStore;

function generatePin(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(PIN_LENGTH, "0");
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getChallengeKey(email: string): string {
  return `pin_challenge:${email.toLowerCase().trim()}`;
}

function getVerifyRateLimitKey(email: string): string {
  return `pin_verify_limit:${email.toLowerCase().trim()}`;
}

// Clean up expired entries from memory store
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
  for (const [key, value] of verifyRateLimitStore.entries()) {
    if (value.expiresAt <= now) {
      verifyRateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for PIN verification attempts
 */
async function checkVerifyRateLimit(email: string): Promise<boolean> {
  const key = getVerifyRateLimitKey(email);
  const now = Date.now();

  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        const data = await redis.get<{ count: number }>(key);
        if (data && data.count >= MAX_VERIFY_ATTEMPTS_PER_WINDOW) {
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error("[PIN] Rate limit check error:", error);
    }
  }

  const memData = verifyRateLimitStore.get(key);
  if (memData && memData.expiresAt > now && memData.count >= MAX_VERIFY_ATTEMPTS_PER_WINDOW) {
    return false;
  }
  return true;
}

/**
 * Increment rate limit counter for PIN verification
 */
async function incrementVerifyRateLimit(email: string): Promise<void> {
  const key = getVerifyRateLimitKey(email);
  const now = Date.now();

  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        const data = await redis.get<{ count: number }>(key);
        const newCount = (data?.count || 0) + 1;
        await redis.set(key, { count: newCount }, { ex: VERIFY_RATE_LIMIT_WINDOW });
        return;
      }
    } catch (error) {
      console.error("[PIN] Rate limit increment error:", error);
    }
  }

  const memData = verifyRateLimitStore.get(key);
  if (memData && memData.expiresAt > now) {
    memData.count += 1;
  } else {
    verifyRateLimitStore.set(key, { count: 1, expiresAt: now + VERIFY_RATE_LIMIT_WINDOW * 1000 });
  }
}

/**
 * Create a new PIN challenge for a user
 * Returns the generated PIN and session token
 */
export async function createPinChallenge(email: string): Promise<{ pin: string; sessionToken: string }> {
  const pin = generatePin();
  const sessionToken = generateSessionToken();
  const key = getChallengeKey(email);
  const data = { pin, attempts: 0, sessionToken };

  console.log(`[PIN] Creating challenge for ${email}, key: ${key}`);
  console.log(`[PIN] Redis configured: ${isRedisConfigured()}`);

  // Always try Redis first if configured
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.set(key, JSON.stringify(data), { ex: PIN_EXPIRY_SECONDS });
        // Verify it was stored
        const verify = await redis.get(key);
        console.log(`[PIN] Created challenge in Redis for ${email}, verified: ${!!verify}`);
        return { pin, sessionToken };
      }
    } catch (error) {
      console.error("[PIN] Redis error, falling back to memory:", error);
    }
  }

  // Fallback to in-memory storage
  cleanupMemoryStore();
  memoryStore.set(key, {
    ...data,
    expiresAt: Date.now() + PIN_EXPIRY_SECONDS * 1000,
  });
  console.log(`[PIN] Created challenge in memory for ${email}, store size: ${memoryStore.size}`);
  
  return { pin, sessionToken };
}

/**
 * Verify a PIN challenge
 * Requires both the correct PIN and the session token from createPinChallenge
 */
export async function verifyPinChallenge(
  email: string,
  inputPin: string,
  sessionToken: string
): Promise<{ success: boolean; reason?: string }> {
  const key = getChallengeKey(email);
  
  // Check rate limit first
  const withinLimit = await checkVerifyRateLimit(email);
  if (!withinLimit) {
    console.log(`[PIN] Rate limit exceeded for ${email}`);
    return { success: false, reason: "RATE_LIMITED" };
  }

  let storedData: { pin: string; attempts: number; sessionToken: string } | null = null;
  let useRedis = false;

  console.log(`[PIN] Verifying challenge for ${email}, key: ${key}`);
  console.log(`[PIN] Redis configured: ${isRedisConfigured()}`);

  // Try Redis first if configured
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        const data = await redis.get<string | { pin: string; attempts: number; sessionToken: string }>(key);
        console.log(`[PIN] Redis lookup result: ${data ? 'found' : 'not found'}`);
        if (data) {
          storedData = typeof data === "string" ? JSON.parse(data) : data;
          useRedis = true;
          console.log(`[PIN] Found challenge in Redis for ${email}`);
        }
      }
    } catch (error) {
      console.error("[PIN] Redis read error:", error);
    }
  }

  // Fallback to memory if not found in Redis
  if (!storedData) {
    cleanupMemoryStore();
    console.log(`[PIN] Checking memory store, size: ${memoryStore.size}, keys: ${Array.from(memoryStore.keys()).join(', ')}`);
    const memData = memoryStore.get(key);
    if (memData && memData.expiresAt > Date.now()) {
      storedData = { pin: memData.pin, attempts: memData.attempts, sessionToken: memData.sessionToken };
      console.log(`[PIN] Found challenge in memory for ${email}`);
    } else if (memData) {
      console.log(`[PIN] Challenge expired in memory for ${email}`);
      memoryStore.delete(key);
    }
  }

  if (!storedData) {
    console.log(`[PIN] No challenge found for ${email}`);
    await incrementVerifyRateLimit(email);
    return { success: false, reason: "PIN_EXPIRED" };
  }

  // Verify session token first (prevents attackers from guessing PINs without valid session)
  if (!storedData.sessionToken || !sessionToken) {
    console.log(`[PIN] Missing session token for ${email}`);
    await incrementVerifyRateLimit(email);
    return { success: false, reason: "INVALID_SESSION" };
  }

  // Check token length before timing-safe comparison
  if (sessionToken.length !== storedData.sessionToken.length) {
    console.log(`[PIN] Session token length mismatch for ${email}`);
    await incrementVerifyRateLimit(email);
    return { success: false, reason: "INVALID_SESSION" };
  }

  const tokenValid = crypto.timingSafeEqual(
    Buffer.from(sessionToken),
    Buffer.from(storedData.sessionToken)
  );
  
  if (!tokenValid) {
    console.log(`[PIN] Invalid session token for ${email}`);
    await incrementVerifyRateLimit(email);
    return { success: false, reason: "INVALID_SESSION" };
  }

  if (storedData.attempts >= MAX_PIN_ATTEMPTS) {
    await clearPinChallenge(email);
    return { success: false, reason: "MAX_ATTEMPTS" };
  }

  // Timing-safe PIN comparison
  const isValid =
    inputPin.length === PIN_LENGTH &&
    crypto.timingSafeEqual(Buffer.from(inputPin), Buffer.from(storedData.pin));

  if (isValid) {
    await clearPinChallenge(email);
    console.log(`[PIN] Verification successful for ${email}`);
    return { success: true };
  }

  // Increment attempts on failure
  storedData.attempts += 1;
  await incrementVerifyRateLimit(email);
  
  if (useRedis && isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        const ttl = await redis.ttl(key);
        await redis.set(key, JSON.stringify(storedData), { ex: ttl > 0 ? ttl : PIN_EXPIRY_SECONDS });
      }
    } catch (error) {
      console.error("[PIN] Redis update error:", error);
    }
  } else {
    const memData = memoryStore.get(key);
    if (memData) {
      memData.attempts = storedData.attempts;
    }
  }

  console.log(`[PIN] Invalid PIN for ${email}, attempts: ${storedData.attempts}`);
  return {
    success: false,
    reason: storedData.attempts >= MAX_PIN_ATTEMPTS ? "MAX_ATTEMPTS" : "INVALID_PIN",
  };
}

/**
 * Clear a PIN challenge
 */
export async function clearPinChallenge(email: string): Promise<void> {
  const key = getChallengeKey(email);

  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.del(key);
      }
    } catch (error) {
      console.error("[PIN] Redis delete error:", error);
    }
  }

  memoryStore.delete(key);
}
