import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats, getStatsByProvince } from "@/app/actions/dashboard";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * GET /api/dashboard
 * Returns dashboard statistics and province breakdown
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

    const [statsResult, provinceResult] = await Promise.all([
      getDashboardStats(),
      getStatsByProvince(),
    ]);

    if (!statsResult.success) {
      return NextResponse.json(
        { error: statsResult.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        stats: statsResult.data,
        byProvince: provinceResult.data,
      },
    });

    // Add rate limit headers to successful response
    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
