import { getRedis, isRedisConfigured } from "./redis";
import crypto from "crypto";

const PIN_LENGTH = 6;
const PIN_EXPIRY_SECONDS = 120; // 2 minutes
const MAX_PIN_ATTEMPTS = 3;

// In-memory fallback - use global to persist across hot reloads in development
const globalForPinStore = globalThis as unknown as {
  pinChallengeStore: Map<string, { pin: string; attempts: number; expiresAt: number }> | undefined;
};

const memoryStore = globalForPinStore.pinChallengeStore ?? new Map<string, { pin: string; attempts: number; expiresAt: number }>();
globalForPinStore.pinChallengeStore = memoryStore;

function generatePin(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(PIN_LENGTH, "0");
}

function getChallengeKey(email: string): string {
  return `pin_challenge:${email.toLowerCase().trim()}`;
}

// Clean up expired entries from memory store
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Create a new PIN challenge for a user
 * Returns the generated PIN to display to the user
 */
export async function createPinChallenge(email: string): Promise<string> {
  const pin = generatePin();
  const key = getChallengeKey(email);
  const data = { pin, attempts: 0 };

  // Always try Redis first if configured
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.set(key, JSON.stringify(data), { ex: PIN_EXPIRY_SECONDS });
        console.log(`[PIN] Created challenge in Redis for ${email}`);
        return pin;
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
  console.log(`[PIN] Created challenge in memory for ${email}`);
  
  return pin;
}

/**
 * Verify a PIN challenge
 */
export async function verifyPinChallenge(
  email: string,
  inputPin: string
): Promise<{ success: boolean; reason?: string }> {
  const key = getChallengeKey(email);
  let storedData: { pin: string; attempts: number } | null = null;
  let useRedis = false;

  // Try Redis first if configured
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        const data = await redis.get<string | { pin: string; attempts: number }>(key);
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
    const memData = memoryStore.get(key);
    if (memData && memData.expiresAt > Date.now()) {
      storedData = { pin: memData.pin, attempts: memData.attempts };
      console.log(`[PIN] Found challenge in memory for ${email}`);
    } else if (memData) {
      memoryStore.delete(key);
    }
  }

  if (!storedData) {
    console.log(`[PIN] No challenge found for ${email}`);
    return { success: false, reason: "PIN_EXPIRED" };
  }

  if (storedData.attempts >= MAX_PIN_ATTEMPTS) {
    await clearPinChallenge(email);
    return { success: false, reason: "MAX_ATTEMPTS" };
  }

  // Timing-safe comparison
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
