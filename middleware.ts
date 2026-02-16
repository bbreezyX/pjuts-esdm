import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - api/auth (NextAuth routes)
     * - sitemap.xml, robots.txt (SEO files)
     * - manifest.json (PWA manifest)
     * - All static assets (.js, .svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|sitemap\\.xml|robots\\.txt|manifest\\.json|.*\\.(?:js|svg|png|jpg|jpeg|gif|webp|ico|json)$).*)",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/forgot-password", "/reset-password"];
  const publicPrefixes = ["/share"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p));

  // API routes that require authentication (except /api/public)
  const isApiRoute =
    pathname.startsWith("/api") && !pathname.startsWith("/api/public");

  // Check for session token (from NextAuth)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Protect API routes
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect non-public routes
  if (!isPublicRoute && !isLoggedIn && !isApiRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
