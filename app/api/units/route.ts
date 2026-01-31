import { NextRequest, NextResponse } from "next/server";
import { getPjutsUnits } from "@/app/actions/units";
import { UnitStatus } from "@prisma/client";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/units
 * Returns paginated list of PJUTS units
 * 
 * Rate limit: SEARCH tier (100 req/min)
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
    // Apply rate limiting
    const rateLimitResult = await withApiRateLimit(request, RATE_LIMIT_TIERS.SEARCH);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

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

    const response = NextResponse.json({
      success: true,
      ...result.data,
    });

    // Add rate limit headers to successful response
    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Units API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
