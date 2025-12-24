import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip all API auth routes - let NextAuth handle them
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Check for session token cookie (NextAuth v5 uses authjs.session-token in production)
    const sessionToken =
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-authjs.session-token")?.value ||
        request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value;

    const isAuthenticated = !!sessionToken;

    // Allow public routes
    if (publicRoutes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(route)))) {
        return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
    ],
};
