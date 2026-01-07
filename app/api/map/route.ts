import { NextRequest, NextResponse } from "next/server";
import { getMapPoints, getMapPointsByStatus } from "@/app/actions/map";
import { UnitStatus } from "@prisma/client";

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
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error) {
    console.error("Map API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

