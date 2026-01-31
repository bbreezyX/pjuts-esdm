import { NextRequest, NextResponse } from "next/server";
import { getMapPoints, getMapPointsByStatus } from "@/app/actions/map";
import { UnitStatus } from "@prisma/client";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
  ApplicationError,
  ErrorCode,
} from "@/lib/errors";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/map
 * Returns map points for the monitoring dashboard
 * 
 * Rate limit: SEARCH tier (100 req/min)
 * 
 * Query params:
 * - status: Filter by unit status (OPERATIONAL, MAINTENANCE_NEEDED, OFFLINE, UNVERIFIED)
 * - north, south, east, west: Map bounds for filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await withApiRateLimit(request, RATE_LIMIT_TIERS.SEARCH);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as UnitStatus | null;
    
    // Check for bounds parameters
    const north = searchParams.get("north");
    const south = searchParams.get("south");
    const east = searchParams.get("east");
    const west = searchParams.get("west");

    let result;

    if (status && Object.values(UnitStatus).includes(status)) {
      result = await getMapPointsByStatus(status);
    } else if (north && south && east && west) {
      result = await getMapPoints({
        north: parseFloat(north),
        south: parseFloat(south),
        east: parseFloat(east),
        west: parseFloat(west),
      });
    } else {
      result = await getMapPoints();
    }

    if (!result.success) {
      throw new ApplicationError(
        result.error || "Failed to fetch map data",
        ErrorCode.AUTHENTICATION_REQUIRED
      );
    }

    const response = createApiSuccessResponse({
      data: result.data,
      count: result.data?.length || 0,
    });

    // Add rate limit headers to successful response
    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
