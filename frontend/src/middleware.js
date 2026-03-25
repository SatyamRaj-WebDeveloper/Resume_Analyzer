import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the user has a token in their browser cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If they try to access the main app without a token, redirect to /register
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  // 2. If they ALREADY have a token, don't let them see the login/register pages again
  if (token && (pathname === '/register' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Tell Next.js which routes this middleware should monitor
export const config = {
  matcher: ['/', '/register', '/login'],
};