import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

// Define protected routes (without locale prefix)
const protectedRoutes = [
  '/profile',
  '/account',
  '/orders',
  '/admin',
]

// Define auth routes (redirect if already authenticated)
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
]

// Define admin routes
const adminRoutes = [
  '/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle internationalization first
  const intlResponse = intlMiddleware(request)

  // If intl middleware returns a redirect, return it
  if (intlResponse.status === 302 || intlResponse.status === 307) {
    return intlResponse
  }

  // Extract locale from pathname for auth checks
  const pathnameWithoutLocale = pathname.replace(/^\/(cs|en)/, '') || '/'

  // Get session
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Check if route is admin route
  const isAdminRoute = adminRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Extract current locale from pathname
  const locale = pathname.match(/^\/(cs|en)/)?.[1] || defaultLocale

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  // Admin route protection (basic check - can be enhanced with role-based access)
  if (isAdminRoute && !isAuthenticated) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return intlResponse
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(cs|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|api|favicon.ico|public|.*\\..*).*)'
  ]
}
