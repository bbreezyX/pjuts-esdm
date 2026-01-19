/**
 * Graceful Degradation Utilities
 *
 * Provides fallback mechanisms and circuit breaker patterns
 * for building resilient applications that handle failures gracefully.
 */

// ============================================
// CIRCUIT BREAKER
// ============================================

export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing, reject requests
  HALF_OPEN = "half_open", // Testing if recovered
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold?: number;
  /** Time to wait before testing recovery in ms (default: 60000) */
  resetTimeoutMs?: number;
  /** Number of successful calls to close circuit (default: 2) */
  successThreshold?: number;
  /** Called when circuit state changes */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  /** Called when circuit opens */
  onOpen?: (error: unknown) => void;
  /** Called when circuit closes */
  onClose?: () => void;
}

const DEFAULT_CB_OPTIONS: Required<Omit<CircuitBreakerOptions, "onStateChange" | "onOpen" | "onClose">> = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  successThreshold: 2,
};

/**
 * Circuit Breaker implementation for preventing cascading failures
 *
 * @example
 * const apiCircuit = new CircuitBreaker({ failureThreshold: 3 });
 *
 * async function fetchWithCircuitBreaker() {
 *   return apiCircuit.call(() => fetchExternalApi());
 * }
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private readonly options: Required<Omit<CircuitBreakerOptions, "onStateChange" | "onOpen" | "onClose">>;
  private readonly onStateChange?: CircuitBreakerOptions["onStateChange"];
  private readonly onOpen?: CircuitBreakerOptions["onOpen"];
  private readonly onClose?: CircuitBreakerOptions["onClose"];

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = { ...DEFAULT_CB_OPTIONS, ...options };
    this.onStateChange = options.onStateChange;
    this.onOpen = options.onOpen;
    this.onClose = options.onClose;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitOpenError(
          "Circuit breaker is OPEN - service unavailable",
          this.getTimeUntilReset()
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs;
  }

  private getTimeUntilReset(): number {
    if (!this.lastFailureTime) return 0;
    return Math.max(
      0,
      this.options.resetTimeoutMs - (Date.now() - this.lastFailureTime)
    );
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.successCount = 0;
        this.onClose?.();
      }
    }
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      this.onOpen?.(error);
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.options.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
      this.onOpen?.(error);
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.onStateChange?.(oldState, newState);
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number | null;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitOpenError extends Error {
  public readonly retryAfterMs: number;

  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = "CircuitOpenError";
    this.retryAfterMs = retryAfterMs;
  }
}

// ============================================
// FALLBACK UTILITIES
// ============================================

export interface FallbackOptions<T> {
  /** Whether to log primary function errors */
  logError?: boolean;
  /** Default value to return if both primary and fallback fail */
  defaultValue?: T;
  /** Function to determine if error should trigger fallback */
  shouldFallback?: (error: unknown) => boolean;
}

/**
 * Execute a function with a fallback if it fails
 *
 * @example
 * const data = await withFallback(
 *   () => fetchFromCache(),
 *   () => fetchFromDatabase(),
 *   { logError: true }
 * );
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: FallbackOptions<T> = {}
): Promise<T> {
  const { logError = true, shouldFallback = () => true } = options;

  try {
    return await primary();
  } catch (error) {
    if (logError) {
      console.error("Primary function failed, using fallback:", error);
    }

    if (!shouldFallback(error)) {
      throw error;
    }

    try {
      return await fallback();
    } catch (fallbackError) {
      if (logError) {
        console.error("Fallback function also failed:", fallbackError);
      }

      if (options.defaultValue !== undefined) {
        return options.defaultValue;
      }

      throw fallbackError;
    }
  }
}

/**
 * Execute a function with multiple fallbacks in sequence
 *
 * @example
 * const data = await withFallbackChain([
 *   () => fetchFromCache(),
 *   () => fetchFromPrimaryDB(),
 *   () => fetchFromReplicaDB(),
 *   () => Promise.resolve(DEFAULT_DATA),
 * ]);
 */
export async function withFallbackChain<T>(
  functions: Array<() => Promise<T>>,
  options: { logErrors?: boolean } = {}
): Promise<T> {
  const { logErrors = true } = options;
  let lastError: unknown;

  for (let i = 0; i < functions.length; i++) {
    try {
      return await functions[i]();
    } catch (error) {
      lastError = error;
      if (logErrors) {
        console.error(`Fallback ${i + 1}/${functions.length} failed:`, error);
      }
    }
  }

  throw lastError;
}

/**
 * Try to execute a function, returning null on failure
 *
 * @example
 * const data = await tryOrNull(() => fetchData());
 * if (!data) {
 *   // Handle missing data
 * }
 */
export async function tryOrNull<T>(
  fn: () => Promise<T>,
  options: { logError?: boolean } = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (options.logError) {
      console.error("Function failed:", error);
    }
    return null;
  }
}

/**
 * Try to execute a function, returning a default value on failure
 *
 * @example
 * const count = await tryOrDefault(() => fetchCount(), 0);
 */
export async function tryOrDefault<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  options: { logError?: boolean } = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options.logError) {
      console.error("Function failed, using default:", error);
    }
    return defaultValue;
  }
}

// ============================================
// TIMEOUT UTILITY
// ============================================

/**
 * Execute a function with a timeout
 *
 * @example
 * const result = await withTimeout(
 *   () => slowOperation(),
 *   5000,
 *   "Operation timed out after 5 seconds"
 * );
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "Operation timed out"
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(timeoutMessage, timeoutMs)), timeoutMs)
    ),
  ]);
}

export class TimeoutError extends Error {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

// ============================================
// BULKHEAD PATTERN
// ============================================

/**
 * Bulkhead pattern - limit concurrent executions to prevent resource exhaustion
 *
 * @example
 * const bulkhead = new Bulkhead(5); // Max 5 concurrent
 * await bulkhead.execute(() => processRequest());
 */
export class Bulkhead {
  private currentConcurrency: number = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.currentConcurrency < this.maxConcurrent) {
      this.currentConcurrency++;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    this.currentConcurrency--;
    const next = this.queue.shift();
    if (next) {
      this.currentConcurrency++;
      next();
    }
  }

  getCurrentConcurrency(): number {
    return this.currentConcurrency;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
