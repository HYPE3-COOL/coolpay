import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /dashboard/* except /dashboard/login
    if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login") {
        // Check for your auth cookie (set by privy or your login logic)
        const authCookie = request.cookies.get("auth")?.value;
        if (!authCookie) {
            // Redirect to login if not authenticated
            const loginUrl = new URL("/dashboard/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Only run middleware on /dashboard/*
export const config = {
    matcher: ["/dashboard/:path*"],
};