import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect seller routes
  if (pathname.startsWith("/seller") || pathname.startsWith("/dashboard/seller")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Simple onboard redirect for authenticated users who haven't chosen role
  // In production use DB flag
  if (token && pathname === "/") {
    // For demo: don't force on every visit
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/dashboard/:path*", "/onboard"],
};
