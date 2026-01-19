# Error Handling System

A comprehensive, production-ready error handling system for the PJUTS ESDM application. This module provides:

- **Custom Error Classes**: Type-safe error hierarchy with metadata support
- **Retry Mechanism**: Exponential backoff with jitter for transient failures
- **Error Aggregation**: Collect multiple validation errors before failing
- **API Utilities**: Standardized error responses for Next.js API routes
- **Resilience Patterns**: Circuit breaker, fallback, timeout, and bulkhead
- **Structured Logging**: Production-ready error logging with context

## Quick Start

```typescript
import {
  NotFoundError,
  ValidationError,
  retry,
  CircuitBreaker,
  withFallback,
  logError,
  ERROR_MESSAGES,
} from "@/lib/errors";
```

## Error Classes

### ApplicationError (Base)

```typescript
throw new ApplicationError(
  "Something went wrong",
  ErrorCode.INTERNAL_ERROR,
  { userId: "123", action: "create_report" }
);
```

### Specialized Errors

```typescript
// Authentication required
throw new AuthenticationError();

// User lacks permission
throw new AuthorizationError("Admin access required", { requiredRole: "ADMIN" });

// Validation failed
throw new ValidationError("Validasi gagal", {
  email: ["Email tidak valid"],
  password: ["Password terlalu pendek"],
});

// Resource not found
throw new NotFoundError("Unit PJUTS", unitId);

// External service failed
throw new ExternalServiceError("R2", "Upload failed", originalError);

// Database error
throw new DatabaseError("Connection failed", originalError);
```

## Retry with Exponential Backoff

```typescript
import { retry, storageRetryOptions } from "@/lib/errors";

// Basic retry
const result = await retry(() => uploadToR2(file), {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
});

// With pre-configured options
const result = await retry(() => uploadToR2(file), storageRetryOptions);

// Custom retry conditions
const result = await retry(
  () => fetchExternalAPI(),
  {
    maxAttempts: 3,
    shouldRetry: (error) => error instanceof NetworkError,
    onRetry: (error, attempt, delay) => {
      console.log(\`Retry \${attempt} after \${delay}ms\`);
    },
  }
);
```

## Error Aggregation

Collect all validation errors instead of failing on the first one:

```typescript
import { ErrorCollector, createValidator } from "@/lib/errors";

// Manual collection
const collector = new ErrorCollector();

if (!data.email) collector.addFieldError("email", "Email diperlukan");
if (!data.name) collector.addFieldError("name", "Nama diperlukan");

collector.throwIfErrors(); // Throws ValidationError with all errors

// Using validator helper
const validator = createValidator();
validator
  .required("email", data.email)
  .email("email", data.email)
  .minLength("password", data.password, 8);

validator.throwIfErrors();
```

## Circuit Breaker

Prevent cascading failures in external service calls:

```typescript
import { CircuitBreaker, CircuitState } from "@/lib/errors";

const apiBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  onOpen: (error) => console.error("Circuit opened:", error),
  onClose: () => console.log("Circuit closed - service recovered"),
});

try {
  const data = await apiBreaker.call(() => fetchExternalAPI());
} catch (error) {
  if (error instanceof CircuitOpenError) {
    // Service unavailable, use fallback
    return getCachedData();
  }
  throw error;
}
```

## Graceful Degradation

```typescript
import { withFallback, withFallbackChain, tryOrDefault } from "@/lib/errors";

// Primary with fallback
const data = await withFallback(
  () => fetchFromCache(),
  () => fetchFromDatabase()
);

// Multiple fallbacks
const data = await withFallbackChain([
  () => fetchFromCache(),
  () => fetchFromPrimaryDB(),
  () => fetchFromReplicaDB(),
  () => Promise.resolve(DEFAULT_DATA),
]);

// Try or use default
const count = await tryOrDefault(() => getReportCount(), 0);
```

## API Error Handling

```typescript
import {
  withApiErrorHandling,
  withAuthenticatedApiHandler,
  createApiErrorResponse,
} from "@/lib/errors";

// Basic API handler with error handling
export const GET = withApiErrorHandling(async (request) => {
  const data = await fetchData();
  return data; // Automatically wrapped in { success: true, data }
});

// Authenticated API handler
export const POST = withAuthenticatedApiHandler(
  async (request, { user }) => {
    const data = await createReport(user.id);
    return data;
  },
  { requireAdmin: false }
);
```

## Logging

```typescript
import { logError, logWarn, createTimer } from "@/lib/errors";

// Log an error with context
logError(error, {
  requestId: "req_123",
  userId: session.user.id,
  action: "submit_report",
});

// Performance logging
const timer = createTimer();
await processData();
timer.log("Data processing"); // Warns if > 1 second
```

## Error Messages

Use centralized Indonesian error messages:

```typescript
import { ERROR_MESSAGES, getErrorMessage, formatError } from "@/lib/errors";

// Direct access
const message = ERROR_MESSAGES.USER_NOT_FOUND;

// Safe access with fallback
const message = getErrorMessage("USER_NOT_FOUND");

// Template formatting
const message = formatError(
  "Unit dengan serial number {serialNumber} sudah ada",
  { serialNumber: "PJUTS-001" }
);
```

## Best Practices

1. **Use Specific Error Classes**: Prefer `NotFoundError` over generic `Error`
2. **Include Context**: Add metadata for debugging
3. **Log at the Right Level**: Use structured logging
4. **Handle at the Right Place**: Catch where you can meaningfully handle
5. **Preserve Stack Traces**: Use error chaining with `cause`
6. **Fail Fast**: Validate early, fail quickly
7. **Retry Transient Failures**: Use retry for network/service calls
8. **Use Circuit Breakers**: Protect against cascading failures
