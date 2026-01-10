"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

// Token expiry time (1 hour)
const TOKEN_EXPIRY_HOURS = 1;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Request password reset - sends email with reset link
 * Security: Always returns success to prevent user enumeration
 */
export async function requestPasswordReset(
  email: string
): Promise<ActionResult> {
  try {
    // Validate email format
    if (!email || !email.includes("@")) {
      return { success: true }; // Don't reveal validation details
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, isActive: true },
    });

    // If user not found or inactive, still return success (security: prevent enumeration)
    if (!user || !user.isActive) {
      return { success: true };
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate secure random token (32 bytes = 256-bit entropy)
    const token = randomBytes(32).toString("hex");

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      token
    );

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      // Still return success to not reveal if email was valid
    }

    return { success: true };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    // Return success to prevent information leakage
    return { success: true };
  }
}

/**
 * Reset password using token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    // Validate inputs
    if (!token || token.length !== 64) {
      return { success: false, error: "Token tidak valid" };
    }

    // Validate password requirements
    if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) {
      return {
        success: false,
        error: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
      };
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return {
        success: false,
        error: "Password harus mengandung huruf besar, huruf kecil, dan angka",
      };
    }

    // Find token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return {
        success: false,
        error: "Token tidak valid atau sudah digunakan",
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return {
        success: false,
        error: "Token sudah kadaluarsa. Silakan minta reset password baru.",
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token (single-use)
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return {
      success: false,
      error: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

/**
 * Validate if a reset token is valid (for UI feedback)
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    if (!token || token.length !== 64) {
      return { valid: false, error: "Token tidak valid" };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: "Token tidak valid atau sudah digunakan" };
    }

    if (new Date() > resetToken.expiresAt) {
      return { valid: false, error: "Token sudah kadaluarsa" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error in validateResetToken:", error);
    return { valid: false, error: "Terjadi kesalahan" };
  }
}
