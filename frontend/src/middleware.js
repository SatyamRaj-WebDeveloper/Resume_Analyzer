import { NextResponse } from 'next/server';

export function middleware(request) {
  
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/register', request.url));
  }


  if (token && (pathname === '/register' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/', '/register', '/login'],
};