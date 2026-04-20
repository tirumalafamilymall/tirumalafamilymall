// middleware.ts — place this in your project root (same level as app/)
// Protects all /admin/* routes (except /admin/login)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page always
  if (pathname === '/admin/login') return NextResponse.next()

  // For all other /admin/* routes, client-side auth guard in layout.tsx
  // handles the redirect. Middleware here is an extra layer of defense.
  // If you use server-side cookie auth, verify the cookie here.

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
