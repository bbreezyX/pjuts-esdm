import { NextResponse } from "next/server";
import { getProvinces } from "@/app/actions/units";

/**
 * GET /api/units/provinces
 * Returns list of unique provinces with PJUTS units
 */
export async function GET() {
  try {
    const result = await getProvinces();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Provinces API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

