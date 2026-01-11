import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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

// Create optimized Prisma client with connection pooling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["error", "warn"] // Remove "query" in dev for better performance
      : ["error"],
    datasourceUrl: getDatabaseUrl(),
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// Helper to disconnect on app shutdown (for serverless)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Execute multiple queries in a transaction for better performance
 * Reduces round-trips to the database
 */
export async function batchQueries<T extends readonly unknown[]>(
  queries: [...{ [K in keyof T]: Promise<T[K]> }]
): Promise<T> {
  return Promise.all(queries) as Promise<T>;
}
