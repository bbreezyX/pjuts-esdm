/**
 * Core Error Classes
 *
 * Defines the error class hierarchy for type-safe error handling.
 * This file has no dependencies to avoid circular imports.
 */

// ============================================
// ERROR CODES
// ============================================

export const ErrorCode = {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: "AUTH_REQUIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",

  // Validation
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // External Services
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  STORAGE_ERROR: "STORAGE_ERROR",
  EMAIL_ERROR: "EMAIL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",

  // Rate Limiting
  RATE_LIMITED: "RATE_LIMITED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Generic
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================
// HTTP STATUS CODE MAPPING
// ============================================

export const ErrorStatusCode: Record<ErrorCodeType, number> = {
  [ErrorCode.AUTHENTICATION_REQUIRED]: 401,
  [ErrorCode.UNAUTHORIZED]: 403,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.ACCOUNT_DISABLED]: 403,
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.STORAGE_ERROR]: 502,
  [ErrorCode.EMAIL_ERROR]: 502,
  [ErrorCode.NETWORK_ERROR]: 503,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.UNKNOWN_ERROR]: 500,
};

// ============================================
// TYPES
// ============================================

export interface ErrorMetadata {
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  code: ErrorCodeType;
  statusCode: number;
  metadata?: ErrorMetadata;
  timestamp: string;
  digest?: string;
}

// ============================================
// BASE APPLICATION ERROR
// ============================================

/**
 * Base error class for all application errors.
 * Provides structured error information for logging and debugging.
 */
export class ApplicationError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly metadata: ErrorMetadata;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.INTERNAL_ERROR,
    metadata: ErrorMetadata = {},
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = ErrorStatusCode[code] || 500;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.isOperational = isOperational;

    // Capture stack trace, excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for API responses (excludes sensitive data)
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Create detailed log entry (includes sensitive data for debugging)
   */
  toLogEntry(): Record<string, unknown> {
    return {
      ...this.toJSON(),
      stack: this.stack,
      isOperational: this.isOperational,
    };
  }
}

// ============================================
// SPECIALIZED ERROR CLASSES
// ============================================

/**
 * Authentication required error - user must log in
 */
export class AuthenticationError extends ApplicationError {
  constructor(
    message: string = "Autentikasi diperlukan. Silakan masuk.",
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.AUTHENTICATION_REQUIRED, metadata);
  }
}

/**
 * Authorization error - user lacks permission
 */
export class AuthorizationError extends ApplicationError {
  constructor(
    message: string = "Anda tidak memiliki akses untuk melakukan tindakan ini.",
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.UNAUTHORIZED, {
      ...metadata,
      requiredRole: metadata.requiredRole,
    });
  }
}

/**
 * Validation error - input data is invalid
 */
export class ValidationError extends ApplicationError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string = "Validasi gagal",
    fieldErrors: Record<string, string[]> = {},
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.VALIDATION_FAILED, {
      ...metadata,
      fieldErrors,
    });
    this.fieldErrors = fieldErrors;
  }

  toJSON(): SerializedError & { fieldErrors: Record<string, string[]> } {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    };
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApplicationError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(
    resourceType: string,
    resourceId: string,
    metadata: ErrorMetadata = {}
  ) {
    const message = `${resourceType} tidak ditemukan`;
    super(message, ErrorCode.NOT_FOUND, {
      ...metadata,
      resourceType,
      resourceId,
    });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Resource already exists error
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, ErrorCode.ALREADY_EXISTS, metadata);
  }
}

/**
 * External service error - third-party service failed
 */
export class ExternalServiceError extends ApplicationError {
  public readonly serviceName: string;
  public readonly originalError?: Error;

  constructor(
    serviceName: string,
    message: string,
    originalError?: Error,
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, {
      ...metadata,
      serviceName,
      originalErrorMessage: originalError?.message,
    });
    this.serviceName = serviceName;
    this.originalError = originalError;

    // Chain the original error
    if (originalError) {
      this.cause = originalError;
    }
  }
}

/**
 * Database error
 */
export class DatabaseError extends ApplicationError {
  constructor(
    message: string = "Terjadi kesalahan database",
    originalError?: Error,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      ErrorCode.DATABASE_ERROR,
      {
        ...metadata,
        originalErrorMessage: originalError?.message,
      },
      false
    ); // Database errors are not operational

    if (originalError) {
      this.cause = originalError;
    }
  }
}

/**
 * Storage error (R2, S3, etc.)
 */
export class StorageError extends ApplicationError {
  constructor(
    message: string = "Gagal mengakses penyimpanan",
    originalError?: Error,
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.STORAGE_ERROR, {
      ...metadata,
      originalErrorMessage: originalError?.message,
    });

    if (originalError) {
      this.cause = originalError;
    }
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends ApplicationError {
  public readonly retryAfterSeconds: number;

  constructor(
    retryAfterSeconds: number,
    message: string = "Terlalu banyak permintaan. Silakan coba lagi nanti.",
    metadata: ErrorMetadata = {}
  ) {
    super(message, ErrorCode.RATE_LIMITED, {
      ...metadata,
      retryAfterSeconds,
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ============================================
// ERROR UTILITIES
// ============================================

/**
 * Check if an error is an operational (expected) error
 */
export function isOperationalError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError && error.isOperational;
}

/**
 * Convert unknown error to ApplicationError
 */
export function normalizeError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      { originalError: error.name },
      false
    );
  }

  return new ApplicationError(
    "An unknown error occurred",
    ErrorCode.UNKNOWN_ERROR,
    { originalValue: String(error) },
    false
  );
}

/**
 * Extract user-safe error message
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.message;
  }

  // Never expose internal error messages to users
  return "Terjadi kesalahan. Silakan coba lagi.";
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(error: unknown): {
  error: string;
  code: string;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
} {
  const normalizedError = normalizeError(error);

  const response: {
    error: string;
    code: string;
    statusCode: number;
    fieldErrors?: Record<string, string[]>;
  } = {
    error: normalizedError.message,
    code: normalizedError.code,
    statusCode: normalizedError.statusCode,
  };

  if (normalizedError instanceof ValidationError) {
    response.fieldErrors = normalizedError.fieldErrors;
  }

  return response;
}
