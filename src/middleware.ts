import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/me", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based auth for admin
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/me", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/me/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
