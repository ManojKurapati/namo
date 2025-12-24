import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define role-based route access
const roleRoutes: Record<string, string[]> = {
    ADMIN: ["/admin"],
    OWNER: ["/dashboard/owner"],
    PARENT: ["/portal"],
};

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

// Routes that should be accessible without auth check
const authRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth routes entirely
    if (authRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get the token from the request
    // NextAuth v5 uses AUTH_SECRET, but we also check NEXTAUTH_SECRET for compatibility
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    });

    // Allow public routes
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
        // Redirect authenticated users away from login/register and home page
        if (token && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
            return redirectToRoleDashboard(request, token.role as string);
        }
        return NextResponse.next();
    }

    // Require authentication for all other routes
    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;

    // Check admin routes
    if (pathname.startsWith("/admin")) {
        if (userRole !== "ADMIN") {
            return redirectToRoleDashboard(request, userRole);
        }
    }

    // Check owner routes
    if (pathname.startsWith("/dashboard/owner")) {
        if (userRole !== "OWNER") {
            return redirectToRoleDashboard(request, userRole);
        }
    }

    // Check parent routes
    if (pathname.startsWith("/portal")) {
        if (userRole !== "PARENT") {
            return redirectToRoleDashboard(request, userRole);
        }
    }

    return NextResponse.next();
}

function redirectToRoleDashboard(request: NextRequest, role: string) {
    let destination = "/login";

    switch (role) {
        case "ADMIN":
            destination = "/admin";
            break;
        case "OWNER":
            destination = "/dashboard/owner";
            break;
        case "PARENT":
            destination = "/portal";
            break;
    }

    return NextResponse.redirect(new URL(destination, request.url));
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
