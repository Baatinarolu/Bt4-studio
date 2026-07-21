import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const rawRole = (token as any)?.role || "BUYER";
  const userRole = String(rawRole).toUpperCase();

  // Admin routes — return 404 for non-admins (as per prompt)
  if (pathname.startsWith("/admin")) {
    if (!token || userRole !== "ADMIN") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  // Seller routes
  if (pathname.startsWith("/seller") || pathname.startsWith("/dashboard/seller")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    if (userRole !== "SELLER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/onboard", request.url));
    }
  }

  // Buyer dashboard
  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/seller")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  if (pathname === "/onboard" && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/dashboard/:path*", "/onboard"],
};
