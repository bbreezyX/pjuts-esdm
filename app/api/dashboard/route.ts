import { NextResponse } from "next/server";
import { getDashboardStats, getStatsByProvince } from "@/app/actions/dashboard";

/**
 * GET /api/dashboard
 * Returns dashboard statistics and province breakdown
 */
export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
        stats: statsResult.data,
        byProvince: provinceResult.data,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

