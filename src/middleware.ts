import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define role-based route access
const roleRoutes: Record<string, string[]> = {
    ADMIN: ["/admin"],
    OWNER: ["/dashboard/owner"],
    PARENT: ["/portal"],
};

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth"];

export default auth(async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await auth();

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        // Redirect authenticated users away from login/register and home page
        if (session && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
            return redirectToRoleDashboard(request, session.user.role);
        }
        return NextResponse.next();
    }

    // Require authentication for all other routes
    if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = session.user.role;

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
});

function redirectToRoleDashboard(request: NextRequest, role: string) {
    let destination = "/";

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
         * - public files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
    ],
};
