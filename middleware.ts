import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET || "labling2025";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboardUser") || pathname.startsWith("/dashboardAdmin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const encoder = new TextEncoder();
      const { payload } = await jwtVerify(token, encoder.encode(SECRET));
      if (pathname.startsWith("/dashboardAdmin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboardUser", request.url));
      }
      if (pathname.startsWith("/dashboardUser") && payload.role === "admin") {
        return NextResponse.redirect(new URL("/dashboardAdmin", request.url));
      }
      return NextResponse.next();
    } catch (err) {
      console.error("JWT error (JOSE):", err);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboardUser/:path*", "/dashboardAdmin/:path*"],
};
