import { NextRequest, NextResponse } from "next/server";
import { getMapPoints, getMapPointsByStatus } from "@/app/actions/map";
import { UnitStatus } from "@prisma/client";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
  ApplicationError,
  ErrorCode,
} from "@/lib/errors";

/**
 * GET /api/map
 * Returns map points for the monitoring dashboard
 * 
 * Query params:
 * - status: Filter by unit status (OPERATIONAL, MAINTENANCE_NEEDED, OFFLINE, UNVERIFIED)
 * - north, south, east, west: Map bounds for filtering
 */
export async function GET(request: NextRequest) {
  try {
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

    return createApiSuccessResponse({
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

