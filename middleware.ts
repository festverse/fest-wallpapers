import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (path.startsWith("/api/cms") && request.method !== "GET") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/cms/:path*"]
};
