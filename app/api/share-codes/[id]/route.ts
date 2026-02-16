import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * PATCH /api/share-codes/[id]
 * Toggle active status of a share code (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 },
    );
  }

  const rateLimitResult = await withApiRateLimit(
    request,
    RATE_LIMIT_TIERS.SENSITIVE,
  );
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id } = await params;

    const existing = await prisma.mapShareCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Share code not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.mapShareCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        code: updated.code,
        isActive: updated.isActive,
      },
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Toggle share code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update share code" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/share-codes/[id]
 * Delete a share code permanently (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 },
    );
  }

  const rateLimitResult = await withApiRateLimit(
    request,
    RATE_LIMIT_TIERS.SENSITIVE,
  );
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id } = await params;

    await prisma.mapShareCode.delete({
      where: { id },
    });

    const response = NextResponse.json({
      success: true,
      message: "Share code deleted",
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Delete share code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete share code" },
      { status: 500 },
    );
  }
}
