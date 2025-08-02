import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;
  
  // Allow access to login and register pages without token
  if (pathname === "/register" || pathname === "/login") {
    if (token) {
      try {
        const isVerified = verifyToken(token);
        if (isVerified) {
          // User is authenticated, redirect to dashboard
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }
    return NextResponse.next();
  }
  
  // For protected routes, check if user has valid token
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  try {
    const isVerified = verifyToken(token);
    if (!isVerified) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/register","/sessions/:path*"],
};
