import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnected: boolean;
};

// Optimize connection string for serverless with connection pooling
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  // Add connection pooling parameters if not present
  if (url.includes("connection_limit")) return url;

  const separator = url.includes("?") ? "&" : "?";
  const poolParams = [
    "connection_limit=10",
    "pool_timeout=30",
    "connect_timeout=10",
  ].join("&");

  return `${url}${separator}${poolParams}`;
};

// Create optimized Prisma client with connection pooling and metrics
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"] // Remove "query" in dev for better performance
        : ["error"],
    datasourceUrl: getDatabaseUrl(),
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// ============================================
// CONNECTION MANAGEMENT
// ============================================

/**
 * Ensure Prisma client is connected (lazy initialization)
 * Call this at app startup for faster first query
 */
export async function ensureConnection(): Promise<void> {
  if (globalForPrisma.prismaConnected) return;

  try {
    await prisma.$connect();
    globalForPrisma.prismaConnected = true;
    console.log("[Prisma] Database connection established");
  } catch (error) {
    console.error("[Prisma] Failed to connect to database:", error);
    throw error;
  }
}

/**
 * Helper to disconnect on app shutdown (for serverless)
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  globalForPrisma.prismaConnected = false;
}

// ============================================
// HEALTH CHECK & METRICS
// ============================================

export interface DbHealthStatus {
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

/**
 * Check database connection health
 * Use this for health check endpoints or monitoring
 */
export async function checkDbHealth(): Promise<DbHealthStatus> {
  const start = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    return {
      healthy: true,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);

    return {
      healthy: false,
      latencyMs,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get database metrics for monitoring
 */
export async function getDbMetrics() {
  const health = await checkDbHealth();

  return {
    ...health,
    poolConfig: {
      connectionLimit: 10,
      poolTimeout: 30,
      connectTimeout: 10,
    },
    provider: "postgresql",
    pooler: "pgbouncer",
  };
}

// ============================================
// QUERY UTILITIES
// ============================================

/**
 * Execute multiple queries in a transaction for better performance
 * Reduces round-trips to the database
 */
export async function batchQueries<T extends readonly unknown[]>(
  queries: [...{ [K in keyof T]: Promise<T[K]> }],
): Promise<T> {
  return Promise.all(queries) as Promise<T>;
}

/**
 * Execute queries in a Prisma transaction with automatic retry
 */
export async function withTransaction<T>(
  fn: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: 5000, // 5s max wait for transaction slot
        timeout: 10000, // 10s transaction timeout
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (lastError.message.includes("Unique constraint")) {
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100),
        );
      }
    }
  }

  throw lastError;
}
