import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";

// Middleware runs on the Edge runtime, which can't use the Node-only
// `getSession()` helper (it relies on `jose` the same way, but we re-check
// the cookie directly here to keep this file dependency-light).
async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/survey");

  if (!protectedRoute) return NextResponse.next();

  const authed = await hasValidSession(req);
  if (!authed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/survey/:path*"],
};
