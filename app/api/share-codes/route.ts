import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateUniqueShareCode } from "@/lib/share-code";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/share-codes
 * Lists all share codes (Admin only)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 },
    );
  }

  const rateLimitResult = await withApiRateLimit(
    request,
    RATE_LIMIT_TIERS.STANDARD,
  );
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const codes = await prisma.mapShareCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({
      success: true,
      data: codes.map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        isActive: c.isActive,
        expiresAt: c.expiresAt,
        usageCount: c.usageCount,
        lastUsedAt: c.lastUsedAt,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
      })),
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("List share codes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch share codes" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/share-codes
 * Create a new share code (Admin only)
 *
 * Body: { label: string, expiresAt?: string (ISO date) }
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { label, expiresAt } = body;

    if (!label || typeof label !== "string" || label.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Label is required" },
        { status: 400 },
      );
    }

    const code = await generateUniqueShareCode();

    const shareCode = await prisma.mapShareCode.create({
      data: {
        code,
        label: label.trim(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: shareCode.id,
        code: shareCode.code,
        label: shareCode.label,
        isActive: shareCode.isActive,
        expiresAt: shareCode.expiresAt,
        createdAt: shareCode.createdAt,
      },
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Create share code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create share code" },
      { status: 500 },
    );
  }
}
