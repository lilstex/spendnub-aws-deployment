import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // Corrected import

export function middleware(request: NextRequest) {
  // Retrieve the token from cookies
  const token = request.cookies.get("spendnub-token")?.value;
  const { pathname } = request.nextUrl;

  // Define your private/protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/income") ||
    pathname.startsWith("/investments") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/insights");

  // Define your public auth routes
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-otp" ||
    pathname === "/reset-password";

  // If no token and trying to access a protected page, go to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access auth pages, go to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on these specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/budget/:path*",
    "/expenses/:path*",
    "/income/:path*",
    "/investments/:path*",
    "/reports/:path*",
    "/insights/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ],
};
