import { NextRequest, NextResponse } from "next/server";
import { getProvinces } from "@/app/actions/units";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/units/provinces
 * Returns list of unique provinces with PJUTS units
 * 
 * Rate limit: STANDARD tier (60 req/min)
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await withApiRateLimit(request, RATE_LIMIT_TIERS.STANDARD);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const result = await getProvinces();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: result.data,
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Provinces API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
