/**
 * Share Code Utilities
 *
 * Handles generation, validation, and cookie management
 * for the public map share code system.
 */

import { cookies } from "next/headers";
import prisma from "./db";

// ============================================
// CONSTANTS
// ============================================

export const SHARE_CODE_COOKIE = "pjuts-share-access";
export const SHARE_CODE_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ============================================
// CODE GENERATION
// ============================================

/**
 * Generate a unique share code in format: ESDM-XXXX
 * Uses uppercase alphanumeric characters (excluding confusing ones like 0/O, 1/I/L)
 */
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ESDM-${suffix}`;
}

/**
 * Generate a unique code that doesn't already exist in the database
 */
export async function generateUniqueShareCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  do {
    code = generateShareCode();
    const existing = await prisma.mapShareCode.findUnique({
      where: { code },
    });
    exists = !!existing;
    attempts++;
  } while (exists && attempts < MAX_ATTEMPTS);

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error("Failed to generate unique share code");
  }

  return code;
}

// ============================================
// CODE VALIDATION
// ============================================

/**
 * Validate a share code and return its details if valid
 */
export async function validateShareCode(code: string) {
  const normalizedCode = code.toUpperCase().trim();

  const shareCode = await prisma.mapShareCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!shareCode) {
    return { valid: false, reason: "Kode akses tidak ditemukan" } as const;
  }

  if (!shareCode.isActive) {
    return { valid: false, reason: "Kode akses sudah dinonaktifkan" } as const;
  }

  if (shareCode.expiresAt && shareCode.expiresAt < new Date()) {
    return { valid: false, reason: "Kode akses sudah kedaluwarsa" } as const;
  }

  // Increment usage count and update last used time
  await prisma.mapShareCode.update({
    where: { id: shareCode.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return {
    valid: true,
    shareCode: {
      id: shareCode.id,
      code: shareCode.code,
      label: shareCode.label,
      expiresAt: shareCode.expiresAt,
    },
  } as const;
}

// ============================================
// COOKIE MANAGEMENT
// ============================================

/**
 * Set the share code access cookie (server-side)
 */
export async function setShareCodeCookie(code: string) {
  const cookieStore = await cookies();
  cookieStore.set(SHARE_CODE_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SHARE_CODE_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Get the share code from the cookie (server-side)
 */
export async function getShareCodeFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SHARE_CODE_COOKIE)?.value ?? null;
}

/**
 * Validate the share code cookie — returns true if the visitor has valid access
 */
export async function hasValidShareAccess(): Promise<boolean> {
  const code = await getShareCodeFromCookie();
  if (!code) return false;

  const normalizedCode = code.toUpperCase().trim();
  const shareCode = await prisma.mapShareCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!shareCode || !shareCode.isActive) return false;
  if (shareCode.expiresAt && shareCode.expiresAt < new Date()) return false;

  return true;
}
