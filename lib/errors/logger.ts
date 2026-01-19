/**
 * Centralized Error Logger
 *
 * Provides structured logging for errors with context preservation,
 * suitable for production debugging and monitoring integration.
 */

import {
  ApplicationError,
  isOperationalError,
  normalizeError,
  type ErrorMetadata,
} from "./errors";

// ============================================
// LOG LEVELS
// ============================================

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

// ============================================
// LOG CONTEXT
// ============================================

export interface LogContext extends ErrorMetadata {
  requestId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface ErrorLogEntry {
  level: LogLevel;
  message: string;
  error: {
    name: string;
    code: string;
    statusCode: number;
    isOperational: boolean;
    stack?: string;
    metadata?: ErrorMetadata;
  };
  context: LogContext;
  timestamp: string;
  environment: string;
}

// ============================================
// LOGGER CLASS
// ============================================

class ErrorLogger {
  private static instance: ErrorLogger;
  private environment: string;
  private isDevelopment: boolean;

  private constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.isDevelopment = this.environment === "development";
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with full context
   */
  error(error: unknown, context: LogContext = {}): void {
    const normalized = normalizeError(error);
    const entry = this.createLogEntry(LogLevel.ERROR, normalized, context);

    // In development, log to console with formatting
    if (this.isDevelopment) {
      this.logToDevelopmentConsole(entry);
    } else {
      // In production, log as JSON for log aggregation services
      this.logToProduction(entry);
    }

    // For non-operational errors, we might want to alert
    if (!isOperationalError(error)) {
      this.handleCriticalError(entry);
    }
  }

  /**
   * Log a warning (expected issues that don't stop execution)
   */
  warn(message: string, context: LogContext = {}): void {
    const entry: Omit<ErrorLogEntry, "error"> & { error?: undefined } = {
      level: LogLevel.WARN,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      console.warn(JSON.stringify(entry));
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context: LogContext = {}): void {
    if (!this.isDevelopment) {
      // Only log info in production if explicitly enabled
      return;
    }
    console.info(`[INFO] ${message}`, context);
  }

  /**
   * Log a debug message (development only)
   */
  debug(message: string, context: LogContext = {}): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  private createLogEntry(
    level: LogLevel,
    error: ApplicationError,
    context: LogContext
  ): ErrorLogEntry {
    return {
      level,
      message: error.message,
      error: {
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        stack: this.isDevelopment ? error.stack : undefined,
        metadata: error.metadata,
      },
      context: {
        ...context,
        timestamp: error.timestamp.toISOString(),
      },
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };
  }

  private logToDevelopmentConsole(entry: ErrorLogEntry): void {
    console.error(
      `\n[${entry.level.toUpperCase()}] ${entry.error.name}: ${entry.message}`
    );
    console.error(`Code: ${entry.error.code} | Status: ${entry.error.statusCode}`);

    if (Object.keys(entry.context).length > 0) {
      console.error("Context:", entry.context);
    }

    if (entry.error.metadata && Object.keys(entry.error.metadata).length > 0) {
      console.error("Metadata:", entry.error.metadata);
    }

    if (entry.error.stack) {
      console.error("Stack trace:", entry.error.stack);
    }

    console.error("");
  }

  private logToProduction(entry: ErrorLogEntry): void {
    // Log as JSON for log aggregation services (e.g., DataDog, CloudWatch, etc.)
    console.error(JSON.stringify(entry));
  }

  private handleCriticalError(entry: ErrorLogEntry): void {
    // In production, this could:
    // - Send to error tracking service (Sentry, Bugsnag, etc.)
    // - Trigger alerts (PagerDuty, Slack, etc.)
    // - Write to error database

    if (!this.isDevelopment) {
      // Placeholder for error tracking integration
      // Example: Sentry.captureException(entry);
      console.error("[CRITICAL] Non-operational error detected:", entry);
    }
  }
}

// ============================================
// EXPORTED FUNCTIONS
// ============================================

const logger = ErrorLogger.getInstance();

/**
 * Log an error with context
 */
export function logError(error: unknown, context: LogContext = {}): void {
  logger.error(error, context);
}

/**
 * Log a warning
 */
export function logWarn(message: string, context: LogContext = {}): void {
  logger.warn(message, context);
}

/**
 * Log info (development only)
 */
export function logInfo(message: string, context: LogContext = {}): void {
  logger.info(message, context);
}

/**
 * Log debug (development only)
 */
export function logDebug(message: string, context: LogContext = {}): void {
  logger.debug(message, context);
}

// ============================================
// ACTION LOGGING HELPERS
// ============================================

/**
 * Create a context for server action logging
 */
export function createActionContext(
  action: string,
  userId?: string,
  extra?: Record<string, unknown>
): LogContext {
  return {
    action,
    userId,
    ...extra,
  };
}

/**
 * Log the result of a server action
 */
export function logActionResult(
  action: string,
  success: boolean,
  context: LogContext = {},
  error?: unknown
): void {
  if (success) {
    logInfo(`Action ${action} completed successfully`, context);
  } else if (error) {
    logError(error, { ...context, action });
  } else {
    logWarn(`Action ${action} failed without error details`, context);
  }
}

// ============================================
// PERFORMANCE LOGGING
// ============================================

/**
 * Create a timer for measuring operation duration
 */
export function createTimer(): {
  elapsed: () => number;
  log: (operation: string, context?: LogContext) => void;
} {
  const start = Date.now();

  return {
    elapsed: () => Date.now() - start,
    log: (operation: string, context: LogContext = {}) => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        // Log slow operations (> 1 second)
        logWarn(`Slow operation: ${operation} took ${duration}ms`, {
          ...context,
          duration,
        });
      } else {
        logDebug(`${operation} completed in ${duration}ms`, {
          ...context,
          duration,
        });
      }
    },
  };
}
