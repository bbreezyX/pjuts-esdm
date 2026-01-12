/**
 * Audit Logging System
 * 
 * Provides tracking for administrative actions including:
 * - User management (create, update, delete, status changes)
 * - Unit management (create, update, delete)
 * - Report management (delete)
 * 
 * All admin actions are logged for security and compliance purposes.
 */

import prisma from "./db";
import { Prisma } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export type AuditAction =
  // User actions
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "TOGGLE_USER_STATUS"
  // Unit actions
  | "CREATE_UNIT"
  | "UPDATE_UNIT"
  | "DELETE_UNIT"
  // Report actions
  | "DELETE_REPORT";

export type EntityType = "USER" | "UNIT" | "REPORT";

export interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  performedBy: string;
  metadata?: Prisma.InputJsonValue;
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Log an audit event to the database
 * 
 * @param params - The audit event parameters
 * @returns The created audit log entry, or null if logging fails
 * 
 * @example
 * await logAuditEvent({
 *   action: "CREATE_USER",
 *   entityType: "USER",
 *   entityId: newUser.id,
 *   performedBy: session.user.id,
 *   metadata: { email: newUser.email, role: newUser.role }
 * });
 */
export async function logAuditEvent(params: AuditLogParams) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        performedBy: params.performedBy,
        metadata: params.metadata ?? undefined,
      },
    });

    return auditLog;
  } catch (error) {
    // Log but don't throw - audit logging should not break the main operation
    console.error("[Audit] Failed to log audit event:", error);
    console.error("[Audit] Event details:", params);
    return null;
  }
}

// ============================================
// HELPER FUNCTIONS FOR COMMON PATTERNS
// ============================================

/**
 * Log a user-related audit event
 */
export async function logUserAudit(
  action: "CREATE_USER" | "UPDATE_USER" | "DELETE_USER" | "TOGGLE_USER_STATUS",
  userId: string,
  performedBy: string,
  metadata?: Prisma.InputJsonValue
) {
  return logAuditEvent({
    action,
    entityType: "USER",
    entityId: userId,
    performedBy,
    metadata,
  });
}

/**
 * Log a unit-related audit event
 */
export async function logUnitAudit(
  action: "CREATE_UNIT" | "UPDATE_UNIT" | "DELETE_UNIT",
  unitId: string,
  performedBy: string,
  metadata?: Prisma.InputJsonValue
) {
  return logAuditEvent({
    action,
    entityType: "UNIT",
    entityId: unitId,
    performedBy,
    metadata,
  });
}

/**
 * Log a report-related audit event
 */
export async function logReportAudit(
  action: "DELETE_REPORT",
  reportId: string,
  performedBy: string,
  metadata?: Prisma.InputJsonValue
) {
  return logAuditEvent({
    action,
    entityType: "REPORT",
    entityId: reportId,
    performedBy,
    metadata,
  });
}
