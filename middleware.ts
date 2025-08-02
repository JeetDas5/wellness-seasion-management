import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;
  if (!token) {
    if (pathname === "/register" || pathname === "/login") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    if (token) {
      const isVerified = await verifyToken(token);
      if (!isVerified) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/register","/sessions/:path*"],
};
