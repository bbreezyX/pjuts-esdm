import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UnitStatus } from "@prisma/client";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * Public Map Points Response Type
 * Stripped-down version of MapPoint for public consumption
 */
interface PublicMapPoint {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  lastStatus: UnitStatus;
}

/**
 * GET /api/public/map
 * Returns map points for the public shareable map
 *
 * No authentication required.
 * Rate limit: SEARCH tier (100 req/min)
 *
 * Query params:
 * - status: Filter by unit status (OPERATIONAL, MAINTENANCE_NEEDED, OFFLINE, UNVERIFIED)
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting even for public endpoint
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
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid or expired access code",
          code: "INVALID_ACCESS",
        },
        { status: 401 },
      );
      // Clear invalid cookie
      response.cookies.set("pjuts-share-access", "", {
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as UnitStatus | null;

    // Build where clause
    const where: Record<string, unknown> = {
      NOT: {
        AND: [{ latitude: 0 }, { longitude: 0 }],
      },
    };

    // Allow filtering by status
    if (status && Object.values(UnitStatus).includes(status)) {
      where.lastStatus = status;
    }

    const units = await prisma.pjutsUnit.findMany({
      where,
      select: {
        id: true,
        serialNumber: true,
        latitude: true,
        longitude: true,
        province: true,
        regency: true,
        lastStatus: true,
      },
    });

    const points: PublicMapPoint[] = units.map((unit) => ({
      id: unit.id,
      serialNumber: unit.serialNumber,
      latitude: unit.latitude,
      longitude: unit.longitude,
      province: unit.province,
      regency: unit.regency,
      lastStatus: unit.lastStatus,
    }));

    const response = NextResponse.json({
      success: true,
      data: points,
      count: points.length,
      generatedAt: new Date().toISOString(),
    });

    // Cache for 5 minutes on CDN
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Public map API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch map data" },
      { status: 500 },
    );
  }
}
