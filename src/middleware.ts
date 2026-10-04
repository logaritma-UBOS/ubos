import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/error') {
    const errorType = request.nextUrl.searchParams.get('error') || 'UnknownError';
    const redirectUrl = new URL(`/login?error=${errorType}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: '/api/auth/error',
}
