import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

/**
 * POST /api/auth/change-password
 * Change user password
 * 
 * Rate limit: SENSITIVE tier (30 req/min)
 * This is a security-sensitive operation, so we use stricter limits.
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (sensitive operation)
    const rateLimitResult = await withApiRateLimit(request, RATE_LIMIT_TIERS.SENSITIVE);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password saat ini tidak sesuai" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    const response = NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
