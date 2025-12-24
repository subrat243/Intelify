import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;

    // Public routes
    const isPublicRoute = pathname.startsWith('/auth/login') || pathname === '/';

    // API routes (handle auth separately in each route)
    const isApiRoute = pathname.startsWith('/api/');

    if (isApiRoute) {
        return NextResponse.next();
    }

    // Redirect to login if not authenticated and trying to access protected route
    if (!isLoggedIn && !isPublicRoute) {
        const loginUrl = new URL('/auth/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if logged in and trying to access login page
    if (isLoggedIn && pathname === '/auth/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect root to dashboard if logged in
    if (isLoggedIn && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
