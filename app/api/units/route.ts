import { NextRequest, NextResponse } from "next/server";
import { getPjutsUnits, getProvinces } from "@/app/actions/units";
import { UnitStatus } from "@prisma/client";

/**
 * GET /api/units
 * Returns paginated list of PJUTS units
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - province: Filter by province
 * - status: Filter by status
 * - search: Search term
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const province = searchParams.get("province") || undefined;
    const status = searchParams.get("status") as UnitStatus | undefined;
    const search = searchParams.get("search") || undefined;

    // Validate status if provided
    if (status && !Object.values(UnitStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 }
      );
    }

    const result = await getPjutsUnits({
      page,
      limit,
      province,
      status,
      search,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error) {
    console.error("Units API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

