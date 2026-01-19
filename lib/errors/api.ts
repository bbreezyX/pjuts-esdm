/**
 * API Error Handling Utilities
 *
 * Standardized error handling for Next.js API routes with proper
 * status codes, structured responses, and logging.
 */

import { NextResponse } from "next/server";

// Import from specific files to avoid circular dependencies
import {
  ApplicationError,
  ValidationError,
  normalizeError,
  ErrorCode,
  ErrorStatusCode,
} from "./errors";

// Inline simple logging to avoid circular dependency
function logErrorSimple(error: ApplicationError, context: Record<string, unknown> = {}): void {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    console.error(`[ERROR] ${error.name}: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      ...context,
    });
  } else {
    console.error(JSON.stringify({
      level: "error",
      message: error.message,
      error: { name: error.name, code: error.code, statusCode: error.statusCode },
      context,
      timestamp: new Date().toISOString(),
    }));
  }
}

// ============================================
// API ERROR RESPONSE TYPE
// ============================================

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  fieldErrors?: Record<string, string[]>;
  timestamp: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

/**
 * Generate a request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a standardized API error response
 */
export function createApiErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const normalizedError = normalizeError(error);
  const rid = requestId || generateRequestId();

  // Log the error
  logErrorSimple(normalizedError, { requestId: rid });

  const response: ApiErrorResponse = {
    success: false,
    error: normalizedError.message,
    code: normalizedError.code,
    timestamp: new Date().toISOString(),
    requestId: rid,
  };

  // Include field errors for validation errors
  if (normalizedError instanceof ValidationError) {
    response.fieldErrors = normalizedError.fieldErrors;
  }

  return NextResponse.json(response, {
    status: normalizedError.statusCode,
    headers: {
      "X-Request-Id": rid,
    },
  });
}

/**
 * Create a standardized API success response
 */
export function createApiSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status, headers }
  );
}

// ============================================
// API ROUTE WRAPPER
// ============================================

type ApiHandler<T> = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<T>;

/**
 * Wrapper for API routes that provides standardized error handling
 *
 * @example
 * export const GET = withApiErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return { data };
 * });
 */
export function withApiErrorHandling<T>(
  handler: ApiHandler<T>
): ApiHandler<NextResponse<ApiResponse<T>>> {
  return async (request, context) => {
    const requestId = generateRequestId();

    try {
      const result = await handler(request, context);
      return createApiSuccessResponse(result);
    } catch (error) {
      return createApiErrorResponse(error, requestId);
    }
  };
}

/**
 * Wrapper that includes authentication check
 *
 * @example
 * export const GET = withAuthenticatedApiHandler(async (request, { user }) => {
 *   const data = await fetchUserData(user.id);
 *   return { data };
 * });
 */
export function withAuthenticatedApiHandler<T>(
  handler: (
    request: Request,
    context: { params: Record<string, string>; user: { id: string; role: string } }
  ) => Promise<T>,
  options: { requireAdmin?: boolean } = {}
): ApiHandler<NextResponse<ApiResponse<T>>> {
  return async (request, context) => {
    const requestId = generateRequestId();

    try {
      // Import auth dynamically to avoid circular dependencies
      const { auth } = await import("@/lib/auth");
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Autentikasi diperlukan",
            code: ErrorCode.AUTHENTICATION_REQUIRED,
            timestamp: new Date().toISOString(),
            requestId,
          },
          {
            status: ErrorStatusCode[ErrorCode.AUTHENTICATION_REQUIRED],
            headers: { "X-Request-Id": requestId },
          }
        );
      }

      if (options.requireAdmin && session.user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Anda tidak memiliki akses admin",
            code: ErrorCode.UNAUTHORIZED,
            timestamp: new Date().toISOString(),
            requestId,
          },
          {
            status: ErrorStatusCode[ErrorCode.UNAUTHORIZED],
            headers: { "X-Request-Id": requestId },
          }
        );
      }

      const result = await handler(request, {
        params: context?.params || {},
        user: {
          id: session.user.id,
          role: session.user.role || "USER",
        },
      });

      return createApiSuccessResponse(result);
    } catch (error) {
      return createApiErrorResponse(error, requestId);
    }
  };
}

// ============================================
// RESPONSE VALIDATION
// ============================================

/**
 * Assert that an action result is successful, throwing if not
 */
export function assertActionSuccess<T>(
  result: { success: boolean; data?: T; error?: string }
): asserts result is { success: true; data: T } {
  if (!result.success) {
    throw new ApplicationError(
      result.error || "Operation failed",
      ErrorCode.INTERNAL_ERROR
    );
  }
}
