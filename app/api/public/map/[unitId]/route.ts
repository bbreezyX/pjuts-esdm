import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/public/map/[unitId]
 * Returns public-safe details for a specific PJUTS unit
 *
 * No authentication required.
 * Rate limit: SEARCH tier (100 req/min)
 *
 * Excludes UNVERIFIED units and sensitive fields like user names.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  try {
    const rateLimitResult = await withApiRateLimit(
      request,
      RATE_LIMIT_TIERS.SEARCH,
    );
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Validate share code access cookie
    const shareCode = request.cookies.get("pjuts-share-access")?.value;
    if (!shareCode) {
      return NextResponse.json(
        { success: false, error: "Access code required", code: "NO_ACCESS" },
        { status: 401 },
      );
    }

    const codeRecord = await prisma.mapShareCode.findUnique({
      where: { code: shareCode.toUpperCase().trim() },
    });

    if (
      !codeRecord ||
      !codeRecord.isActive ||
      (codeRecord.expiresAt && codeRecord.expiresAt < new Date())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired access code",
          code: "INVALID_ACCESS",
        },
        { status: 401 },
      );
    }

    const { unitId } = await params;

    if (!unitId) {
      return NextResponse.json(
        { success: false, error: "Unit ID is required" },
        { status: 400 },
      );
    }

    const unit = await prisma.pjutsUnit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        serialNumber: true,
        latitude: true,
        longitude: true,
        province: true,
        regency: true,
        district: true,
        village: true,
        lastStatus: true,
        installDate: true,
        reports: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            batteryVoltage: true,
            notes: true,
            createdAt: true,
            // Exclude user info and exact GPS for public
          },
        },
        _count: {
          select: { reports: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        unit: {
          id: unit.id,
          serialNumber: unit.serialNumber,
          latitude: unit.latitude,
          longitude: unit.longitude,
          province: unit.province,
          regency: unit.regency,
          district: unit.district,
          village: unit.village,
          lastStatus: unit.lastStatus,
          installDate: unit.installDate,
        },
        recentReports: unit.reports.map((r) => ({
          id: r.id,
          batteryVoltage: r.batteryVoltage,
          notes: r.notes,
          createdAt: r.createdAt,
        })),
        reportCount: unit._count.reports,
      },
    });

    // Cache for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Public unit detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unit details" },
      { status: 500 },
    );
  }
}
