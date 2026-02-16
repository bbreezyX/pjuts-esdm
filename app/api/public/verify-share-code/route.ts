import { NextRequest, NextResponse } from "next/server";
import { validateShareCode } from "@/lib/share-code";
import {
  withApiRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from "@/lib/api-rate-limit";

/**
 * POST /api/public/verify-share-code
 * Validates a share code and sets an access cookie.
 *
 * No authentication required. Rate limited to SENSITIVE tier.
 *
 * Body: { code: string }
 * Response: { success: true, expiresAt?: string } or { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  // Apply strict rate limiting to prevent brute-force
  const rateLimitResult = await withApiRateLimit(
    request,
    RATE_LIMIT_TIERS.SENSITIVE,
  );
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Kode akses diperlukan" },
        { status: 400 },
      );
    }

    const result = await validateShareCode(code);

    if (!result.valid) {
      const response = NextResponse.json(
        { success: false, error: result.reason },
        { status: 401 },
      );
      return applyRateLimitHeaders(response, rateLimitResult);
    }

    // Create response with the cookie set
    const response = NextResponse.json({
      success: true,
      data: {
        code: result.shareCode.code,
        label: result.shareCode.label,
        expiresAt: result.shareCode.expiresAt,
      },
    });

    // Set the access cookie
    response.cookies.set("pjuts-share-access", result.shareCode.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Verify share code error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
