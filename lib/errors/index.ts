/**
 * Centralized Error Handling System
 *
 * This module provides a comprehensive error handling architecture:
 * - Custom error class hierarchy for type-safe error handling
 * - Retry mechanisms with exponential backoff
 * - Error aggregation for validation
 * - API error response utilities
 * - Circuit breaker and graceful degradation patterns
 * - Structured logging for production debugging
 *
 * @example
 * // Using custom error classes
 * import { NotFoundError, ValidationError } from "@/lib/errors";
 *
 * if (!user) throw new NotFoundError("User", id);
 *
 * @example
 * // Using retry with backoff
 * import { retry, storageRetryOptions } from "@/lib/errors";
 *
 * const result = await retry(() => uploadToR2(file), storageRetryOptions);
 *
 * @example
 * // Using circuit breaker
 * import { CircuitBreaker } from "@/lib/errors";
 *
 * const apiBreaker = new CircuitBreaker({ failureThreshold: 5 });
 * const data = await apiBreaker.call(() => fetchExternalAPI());
 *
 * @module lib/errors
 */

// ============================================
// RE-EXPORT CORE ERROR CLASSES
// ============================================

export {
  // Error codes
  ErrorCode,
  ErrorStatusCode,
  type ErrorCodeType,

  // Types
  type ErrorMetadata,
  type SerializedError,

  // Base error class
  ApplicationError,

  // Specialized error classes
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
  DatabaseError,
  StorageError,
  RateLimitError,

  // Utilities
  isOperationalError,
  normalizeError,
  getSafeErrorMessage,
  createErrorResponse,
} from "./errors";

// ============================================
// RE-EXPORT ERROR MESSAGES
// ============================================

export { ERROR_MESSAGES, getErrorMessage, formatError } from "./messages";

// ============================================
// RE-EXPORT RETRY UTILITIES
// ============================================

export {
  retry,
  withRetry,
  retryable,
  databaseRetryOptions,
  storageRetryOptions,
  emailRetryOptions,
  apiRetryOptions,
  type RetryOptions,
} from "./retry";

// ============================================
// RE-EXPORT ERROR AGGREGATION
// ============================================

export { ErrorCollector, validateAll, createValidator } from "./aggregation";

// ============================================
// RE-EXPORT API UTILITIES
// ============================================

export {
  createApiErrorResponse,
  createApiSuccessResponse,
  withApiErrorHandling,
  withAuthenticatedApiHandler,
  assertActionSuccess,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type ApiResponse,
} from "./api";

// ============================================
// RE-EXPORT RESILIENCE PATTERNS
// ============================================

export {
  CircuitBreaker,
  CircuitState,
  CircuitOpenError,
  withFallback,
  withFallbackChain,
  tryOrNull,
  tryOrDefault,
  withTimeout,
  TimeoutError,
  Bulkhead,
  type CircuitBreakerOptions,
  type FallbackOptions,
} from "./resilience";

// ============================================
// RE-EXPORT LOGGING
// ============================================

export {
  logError,
  logWarn,
  logInfo,
  logDebug,
  createActionContext,
  logActionResult,
  createTimer,
  LogLevel,
  type LogContext,
  type ErrorLogEntry,
} from "./logger";
