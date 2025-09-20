import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create the internationalization middleware with enhanced configuration
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

// Initialize rate limiting with error handling
let redis: Redis | null = null;
let rateLimitingEnabled = true;

try {
  // Try to initialize Redis client
  redis = Redis.fromEnv();
} catch (error) {
  console.error("Failed to initialize Redis for rate limiting:", error);
  rateLimitingEnabled = false;
}

// Different rate limits for different types of requests (only if Redis is available)
let generalRateLimit: Ratelimit | null = null;
let apiRateLimit: Ratelimit | null = null;
let authRateLimit: Ratelimit | null = null;
let strictRateLimit: Ratelimit | null = null;

if (redis && rateLimitingEnabled) {
  generalRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
  });

  apiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 API requests per minute
    analytics: true,
  });

  authRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 auth attempts per minute
    analytics: true,
  });

  strictRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute for sensitive operations
    analytics: true,
  });
}

// Define protected routes (without locale prefix)
const protectedRoutes = ["/profile", "/account", "/orders", "/admin"];

// Define auth routes (redirect if already authenticated)
const authRoutes = ["/auth/signin", "/auth/signup"];

// Define admin routes
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client IP for rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "127.0.0.1";

  // Apply rate limiting based on route type (only if rate limiting is enabled)
  let rateLimitResult;

  if (rateLimitingEnabled && redis) {
    if (pathname.startsWith("/api/")) {
      // API routes get stricter rate limiting
      if (pathname.includes("/auth/") || pathname.includes("/payment")) {
        rateLimitResult = authRateLimit ? await authRateLimit.limit(ip) : null;
      } else if (pathname.includes("/admin/") || pathname.includes("/orders/")) {
        rateLimitResult = strictRateLimit ? await strictRateLimit.limit(ip) : null;
      } else if (pathname.includes("/contact")) {
        // Contact form gets moderate rate limiting (5 per minute)
        rateLimitResult = authRateLimit ? await authRateLimit.limit(ip) : null;
      } else {
        rateLimitResult = apiRateLimit ? await apiRateLimit.limit(ip) : null;
      }
    } else {
      // General page requests
      rateLimitResult = generalRateLimit ? await generalRateLimit.limit(ip) : null;
    }
  }

  // Check if rate limit exceeded (only if rate limiting is enabled and result exists)
  if (rateLimitResult && !rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          retryAfter: Math.round(rateLimitResult.reset / 1000),
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.round(rateLimitResult.reset / 1000).toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
        },
      }
    );
  }

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // If intl middleware returns a redirect, return it
  if (intlResponse.status === 302 || intlResponse.status === 307) {
    return intlResponse;
  }

  // Extract locale from pathname for auth checks
  const pathnameWithoutLocale = pathname.replace(/^\/(cs|en)/, "") || "/";

  // Get session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Check if route is admin route
  const isAdminRoute = adminRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Extract current locale from pathname
  const locale = pathname.match(/^\/(cs|en)/)?.[1] || defaultLocale;

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Admin route protection with role-based access
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check admin role for admin routes
    try {
      const { userUtils } = await import("@/lib/supabase/utils");
      const isAdmin = await userUtils.isAdmin(session.user?.id || "");

      if (!isAdmin) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(cs|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|api|favicon.ico|public|.*\\..*).*)",
  ],
};
