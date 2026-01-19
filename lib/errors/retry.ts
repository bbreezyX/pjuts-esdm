/**
 * Retry Utility with Exponential Backoff
 *
 * Provides robust retry mechanisms for handling transient failures
 * in external service calls (database, storage, email, etc.)
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffFactor?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Jitter factor to randomize delays (0-1, default: 0.1) */
  jitterFactor?: number;
  /** Specific error types to retry on */
  retryOn?: Array<new (...args: unknown[]) => Error>;
  /** Function to determine if an error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "retryOn" | "shouldRetry" | "onRetry">> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 30000,
  jitterFactor: 0.1,
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  backoffFactor: number,
  maxDelayMs: number,
  jitterFactor: number
): number {
  const exponentialDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, cappedDelay + jitter);
}

/**
 * Default retry condition - retries on network errors and 5xx responses
 */
function defaultShouldRetry(error: unknown): boolean {
  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("socket")
    ) {
      return true;
    }
  }

  // Retry on HTTP 5xx errors or rate limiting
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    if (status >= 500 || status === 429) {
      return true;
    }
  }

  return false;
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @example
 * const result = await retry(
 *   () => fetchExternalAPI(),
 *   {
 *     maxAttempts: 3,
 *     onRetry: (error, attempt) => console.log(`Retry ${attempt}:`, error)
 *   }
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(error, attempt)
        : options.retryOn
          ? options.retryOn.some((ErrorClass) => error instanceof ErrorClass)
          : defaultShouldRetry(error);

      // If this was the last attempt or we shouldn't retry, throw
      if (attempt === config.maxAttempts || !shouldRetry) {
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        config.initialDelayMs,
        config.backoffFactor,
        config.maxDelayMs,
        config.jitterFactor
      );

      // Notify about retry
      if (options.onRetry) {
        options.onRetry(error, attempt, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable version of an async function
 *
 * @example
 * const retryableFetch = withRetry(fetchData, { maxAttempts: 3 });
 * const result = await retryableFetch(url);
 */
export function withRetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retry(() => fn(...args), options);
}

/**
 * Retry decorator for class methods
 *
 * @example
 * class ApiClient {
 *   @retryable({ maxAttempts: 3 })
 *   async fetchData() { ... }
 * }
 */
export function retryable(options: RetryOptions = {}) {
  return function <T>(
    _target: object,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) return descriptor;

    descriptor.value = function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

// ============================================
// PRE-CONFIGURED RETRY STRATEGIES
// ============================================

/**
 * Retry strategy for database operations
 */
export const databaseRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  backoffFactor: 2,
  maxDelayMs: 5000,
  shouldRetry: (error) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("connection") ||
        message.includes("timeout") ||
        message.includes("deadlock") ||
        message.includes("lock wait")
      );
    }
    return false;
  },
};

/**
 * Retry strategy for storage operations (R2, S3)
 */
export const storageRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffFactor: 2,
  maxDelayMs: 10000,
  shouldRetry: (error) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("temporarily unavailable") ||
        message.includes("503") ||
        message.includes("500")
      );
    }
    return false;
  },
};

/**
 * Retry strategy for email sending
 */
export const emailRetryOptions: RetryOptions = {
  maxAttempts: 2,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 5000,
  shouldRetry: (error) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("connection") ||
        message.includes("timeout") ||
        message.includes("temporarily") ||
        message.includes("rate limit")
      );
    }
    return false;
  },
};

/**
 * Retry strategy for external APIs
 */
export const apiRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 30000,
  jitterFactor: 0.2, // Higher jitter for APIs
};
