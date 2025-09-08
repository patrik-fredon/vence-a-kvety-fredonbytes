import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'

// Define protected routes
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

  // Get session
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if route is admin route
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin route protection (basic check - can be enhanced with role-based access)
  if (isAdminRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
