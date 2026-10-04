import { auth } from "@/auth"
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  if (req.nextUrl.pathname === '/api/auth/error') {
    const errorType = req.nextUrl.searchParams.get('error') || 'UnknownError';
    const redirectUrl = new URL(`/login?error=${errorType}`, req.url)
    return NextResponse.redirect(redirectUrl)
  }
  // Allow request to proceed for other routes
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register|onboarding).*)', '/api/auth/error'],
}
