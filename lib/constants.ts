/**
 * Business Constants
 * 
 * Centralized configuration for business logic values.
 * Change values here to update behavior across the entire application.
 */

import { UnitStatus } from "@prisma/client";

// ============================================
// BATTERY VOLTAGE THRESHOLDS
// ============================================

/**
 * Battery voltage thresholds for determining unit status
 * - >= OPERATIONAL_MIN (20V): Unit is operational
 * - >= MAINTENANCE_MIN (10V) and < OPERATIONAL_MIN: Needs maintenance
 * - < MAINTENANCE_MIN (10V): Unit is offline/critical
 */
export const BATTERY_THRESHOLDS = {
  /** Minimum voltage for operational status (in Volts) */
  OPERATIONAL_MIN: 20,
  /** Minimum voltage for maintenance needed status (in Volts) */
  MAINTENANCE_MIN: 10,
} as const;

// ============================================
// BATTERY STATUS HELPERS
// ============================================

/**
 * Get the unit status based on battery voltage
 */
export function getStatusFromVoltage(voltage: number): UnitStatus {
  if (voltage >= BATTERY_THRESHOLDS.OPERATIONAL_MIN) {
    return UnitStatus.OPERATIONAL;
  }
  if (voltage >= BATTERY_THRESHOLDS.MAINTENANCE_MIN) {
    return UnitStatus.MAINTENANCE_NEEDED;
  }
  return UnitStatus.OFFLINE;
}

/**
 * Get the status label in Indonesian based on battery voltage
 */
export function getVoltageStatusLabel(voltage: number): string {
  if (voltage >= BATTERY_THRESHOLDS.OPERATIONAL_MIN) {
    return "Operasional";
  }
  if (voltage >= BATTERY_THRESHOLDS.MAINTENANCE_MIN) {
    return "Perlu Perawatan";
  }
  return "Offline";
}

/**
 * Get the status variant for UI badges based on battery voltage
 */
export function getStatusVariant(voltage: number): "success" | "warning" | "destructive" {
  if (voltage >= BATTERY_THRESHOLDS.OPERATIONAL_MIN) {
    return "success";
  }
  if (voltage >= BATTERY_THRESHOLDS.MAINTENANCE_MIN) {
    return "warning";
  }
  return "destructive";
}

/**
 * Check if battery voltage indicates operational status
 */
export function isOperational(voltage: number): boolean {
  return voltage >= BATTERY_THRESHOLDS.OPERATIONAL_MIN;
}

/**
 * Check if battery voltage indicates maintenance needed
 */
export function needsMaintenance(voltage: number): boolean {
  return voltage >= BATTERY_THRESHOLDS.MAINTENANCE_MIN && 
         voltage < BATTERY_THRESHOLDS.OPERATIONAL_MIN;
}

/**
 * Check if battery voltage indicates offline/critical status
 */
export function isOffline(voltage: number): boolean {
  return voltage < BATTERY_THRESHOLDS.MAINTENANCE_MIN;
}

// ============================================
// OTHER BUSINESS CONSTANTS
// ============================================

/**
 * Maximum number of images per report
 */
export const MAX_REPORT_IMAGES = 3;

/**
 * Maximum file size for uploaded images (in bytes)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Accepted image MIME types
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * Session duration (in seconds)
 */
export const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Time window in minutes */
  WINDOW_MINUTES: 15,
  /** Maximum attempts per window */
  MAX_ATTEMPTS: 5,
  /** Block duration in minutes after exceeding limit */
  BLOCK_DURATION_MINUTES: 30,
} as const;
