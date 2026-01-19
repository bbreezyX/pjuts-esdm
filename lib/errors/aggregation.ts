/**
 * Error Aggregation Pattern
 *
 * Collects multiple errors instead of failing on the first one.
 * Useful for validation scenarios where you want to report all issues at once.
 */

import { ValidationError } from "./errors";

/**
 * Error collector for aggregating multiple validation errors
 *
 * @example
 * const collector = new ErrorCollector();
 *
 * if (!data.email) collector.addFieldError("email", "Email diperlukan");
 * if (!data.name) collector.addFieldError("name", "Nama diperlukan");
 *
 * collector.throwIfErrors(); // Throws ValidationError with all collected errors
 */
export class ErrorCollector {
  private fieldErrors: Map<string, string[]> = new Map();
  private generalErrors: string[] = [];

  /**
   * Add a field-specific error
   */
  addFieldError(field: string, message: string): this {
    const existing = this.fieldErrors.get(field) || [];
    existing.push(message);
    this.fieldErrors.set(field, existing);
    return this;
  }

  /**
   * Add multiple errors for a field at once
   */
  addFieldErrors(field: string, messages: string[]): this {
    for (const message of messages) {
      this.addFieldError(field, message);
    }
    return this;
  }

  /**
   * Add a general (non-field-specific) error
   */
  addError(message: string): this {
    this.generalErrors.push(message);
    return this;
  }

  /**
   * Merge errors from a Zod validation result
   */
  mergeZodErrors(zodErrors: Record<string, string[] | undefined>): this {
    for (const [field, messages] of Object.entries(zodErrors)) {
      if (messages) {
        this.addFieldErrors(field, messages);
      }
    }
    return this;
  }

  /**
   * Merge errors from another ErrorCollector
   */
  merge(other: ErrorCollector): this {
    for (const [field, messages] of other.fieldErrors) {
      this.addFieldErrors(field, messages);
    }
    for (const message of other.generalErrors) {
      this.addError(message);
    }
    return this;
  }

  /**
   * Check if any errors have been collected
   */
  hasErrors(): boolean {
    return this.fieldErrors.size > 0 || this.generalErrors.length > 0;
  }

  /**
   * Get total number of errors
   */
  errorCount(): number {
    let count = this.generalErrors.length;
    for (const messages of this.fieldErrors.values()) {
      count += messages.length;
    }
    return count;
  }

  /**
   * Get all field errors as a plain object
   */
  getFieldErrors(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [field, messages] of this.fieldErrors) {
      result[field] = [...messages];
    }
    return result;
  }

  /**
   * Get general errors
   */
  getGeneralErrors(): string[] {
    return [...this.generalErrors];
  }

  /**
   * Get all errors as a flat list
   */
  getAllErrors(): string[] {
    const errors: string[] = [...this.generalErrors];
    for (const [field, messages] of this.fieldErrors) {
      for (const message of messages) {
        errors.push(`${field}: ${message}`);
      }
    }
    return errors;
  }

  /**
   * Get a summary message
   */
  getSummary(): string {
    const count = this.errorCount();
    if (count === 0) return "Tidak ada kesalahan";
    if (count === 1) return this.getAllErrors()[0];
    return `${count} kesalahan ditemukan`;
  }

  /**
   * Clear all collected errors
   */
  clear(): this {
    this.fieldErrors.clear();
    this.generalErrors = [];
    return this;
  }

  /**
   * Throw ValidationError if any errors have been collected
   */
  throwIfErrors(): void {
    if (this.hasErrors()) {
      throw new ValidationError(
        this.getSummary(),
        this.getFieldErrors(),
        { generalErrors: this.generalErrors }
      );
    }
  }

  /**
   * Create a ValidationError from collected errors (without throwing)
   */
  toValidationError(): ValidationError | null {
    if (!this.hasErrors()) return null;
    return new ValidationError(
      this.getSummary(),
      this.getFieldErrors(),
      { generalErrors: this.generalErrors }
    );
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Run multiple validation functions and collect all errors
 *
 * @example
 * const errors = await validateAll(
 *   () => validateEmail(email),
 *   () => validatePassword(password),
 *   () => validateUsername(username)
 * );
 *
 * if (errors.hasErrors()) {
 *   return errors.toValidationError();
 * }
 */
export async function validateAll(
  ...validators: Array<() => void | Promise<void> | ErrorCollector | Promise<ErrorCollector>>
): Promise<ErrorCollector> {
  const collector = new ErrorCollector();

  const results = await Promise.allSettled(
    validators.map((validator) => Promise.resolve(validator()))
  );

  for (const result of results) {
    if (result.status === "rejected") {
      const error = result.reason;
      if (error instanceof ValidationError) {
        collector.mergeZodErrors(error.fieldErrors);
      } else if (error instanceof Error) {
        collector.addError(error.message);
      } else {
        collector.addError(String(error));
      }
    } else if (result.value instanceof ErrorCollector) {
      collector.merge(result.value);
    }
  }

  return collector;
}

/**
 * Create a validation result helper for common checks
 *
 * @example
 * const validate = createValidator();
 * validate.required("email", email);
 * validate.email("email", email);
 * validate.minLength("password", password, 8);
 * validate.throwIfErrors();
 */
export function createValidator(): ErrorCollector & {
  required: (field: string, value: unknown, message?: string) => ErrorCollector;
  email: (field: string, value: string, message?: string) => ErrorCollector;
  minLength: (field: string, value: string, min: number, message?: string) => ErrorCollector;
  maxLength: (field: string, value: string, max: number, message?: string) => ErrorCollector;
  pattern: (field: string, value: string, regex: RegExp, message: string) => ErrorCollector;
  number: (field: string, value: unknown, message?: string) => ErrorCollector;
  range: (field: string, value: number, min: number, max: number, message?: string) => ErrorCollector;
} {
  const collector = new ErrorCollector();

  return Object.assign(collector, {
    required(field: string, value: unknown, message?: string) {
      if (value === undefined || value === null || value === "") {
        collector.addFieldError(field, message || `${field} diperlukan`);
      }
      return collector;
    },

    email(field: string, value: string, message?: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        collector.addFieldError(field, message || "Format email tidak valid");
      }
      return collector;
    },

    minLength(field: string, value: string, min: number, message?: string) {
      if (value && value.length < min) {
        collector.addFieldError(
          field,
          message || `${field} minimal ${min} karakter`
        );
      }
      return collector;
    },

    maxLength(field: string, value: string, max: number, message?: string) {
      if (value && value.length > max) {
        collector.addFieldError(
          field,
          message || `${field} maksimal ${max} karakter`
        );
      }
      return collector;
    },

    pattern(field: string, value: string, regex: RegExp, message: string) {
      if (value && !regex.test(value)) {
        collector.addFieldError(field, message);
      }
      return collector;
    },

    number(field: string, value: unknown, message?: string) {
      if (value !== undefined && value !== null && isNaN(Number(value))) {
        collector.addFieldError(field, message || `${field} harus berupa angka`);
      }
      return collector;
    },

    range(field: string, value: number, min: number, max: number, message?: string) {
      if (value < min || value > max) {
        collector.addFieldError(
          field,
          message || `${field} harus antara ${min} dan ${max}`
        );
      }
      return collector;
    },
  });
}
