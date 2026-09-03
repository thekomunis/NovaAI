import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')?.value;
    const tokenHash = request.cookies.get('admin_token_hash')?.value;

    if (!session || !tokenHash) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect logged-in admins away from login page
  if (pathname === '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    const tokenHash = request.cookies.get('admin_token_hash')?.value;

    if (session && tokenHash) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
