import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { rateLimiter } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // rate limit API routes
    if (pathname.startsWith("/api")) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ip = req.ip ?? forwardedFor?.split(",")[0]?.trim() ?? "127.0.0.1";

      try {
        const { success } = await rateLimiter.limit(ip);

        if (!success) {
          return new NextResponse("Too many requests", { status: 429 });
        }
      } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
      }

      return NextResponse.next();
    }

    // protect sensitive app routes
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    const sensitiveRoutes = [
      "/dashboard",
      "/quiz",
      "/history",
      "/statistics",
      "/play",
    ];

    if (
      !isAuthenticated &&
      sensitiveRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        // always run the middleware above
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/quiz/:path*",
    "/history/:path*",
    "/statistics/:path*",
    "/play/:path*",
  ],
};
