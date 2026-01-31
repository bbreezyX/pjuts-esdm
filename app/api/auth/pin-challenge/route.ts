import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db";
import { createPinChallenge, verifyPinChallenge } from "@/lib/pin-challenge";
import {
  checkRateLimit,
  incrementRateLimit,
  getLoginRateLimitKey,
} from "@/lib/rate-limit";

// Dummy hash for timing attack prevention
const DUMMY_HASH =
  "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.E/XxH1d.sXuCGG";

const requestPinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const verifyPinSchema = z.object({
  email: z.string().email(),
  pin: z.string().length(6).regex(/^\d+$/),
  sessionToken: z.string().min(1),
});

/**
 * POST /api/auth/pin-challenge
 * Step 1: Validate credentials and generate PIN challenge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, password } = requestPinSchema.parse(body);
    const email = rawEmail.toLowerCase().trim();

    // Check rate limit
    const rateLimitKey = getLoginRateLimitKey(email);
    const rateLimitCheck = await checkRateLimit(rateLimitKey);

    if (!rateLimitCheck.success) {
      await bcrypt.compare(password, DUMMY_HASH);
      return NextResponse.json(
        { error: "RATE_LIMITED", retryAfter: rateLimitCheck.retryAfterSeconds },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, isActive: true },
    });

    // Timing-safe password comparison
    const passwordToCompare = user?.password ?? DUMMY_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isValidPassword) {
      await incrementRateLimit(rateLimitKey);
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "ACCOUNT_DISABLED" },
        { status: 403 }
      );
    }

    // Generate PIN challenge
    const { pin, sessionToken } = await createPinChallenge(email);

    return NextResponse.json({
      success: true,
      pin, // Display this to the user
      sessionToken, // Store this client-side for verification
      expiresIn: 120, // seconds
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PIN challenge error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/pin-challenge
 * Step 2: Verify PIN and return verification token
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, pin, sessionToken } = verifyPinSchema.parse(body);
    const email = rawEmail.toLowerCase().trim();

    const result = await verifyPinChallenge(email, pin, sessionToken);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        PIN_EXPIRED: 410,
        MAX_ATTEMPTS: 429,
        INVALID_PIN: 401,
        INVALID_SESSION: 401,
        RATE_LIMITED: 429,
      };
      return NextResponse.json(
        { error: result.reason },
        { status: statusMap[result.reason || "INVALID_PIN"] || 401 }
      );
    }

    // PIN verified - return a short-lived token for the actual sign-in
    // This token proves the user passed the PIN challenge
    const verificationToken = Buffer.from(
      JSON.stringify({ email, verified: true, exp: Date.now() + 30000 })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      verificationToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PIN verification error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
