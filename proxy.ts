import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// We use jose for JWT verification in middleware as it's Edge-compatible
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('tt_session')?.value || request.cookies.get('user_session')?.value;

  // 1. Define Protected Route Groups
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/student') || pathname.startsWith('/dashboard');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 2. Allow public assets and API routes (APIs handle their own auth for now)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // 3. Handle Authentication
  if (!sessionToken) {
    // Redirect to login if trying to access any protected route
    if (isTeacherRoute || isAdminRoute || isStudentRoute || isOnboardingRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verify JWT
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    const userRole = payload.role as string;
    const userId = payload.userId as string;

    // 4. Role-Based Access Control (RBAC)
    
    // Admin Routes: Strict ADMIN and Super Admins
    if (isAdminRoute && !['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Teacher Routes: TEACHER, INSTRUCTOR or ADMINs
    if (isTeacherRoute && !['TEACHER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Auth Routes: If already logged in, redirect to appropriate dashboard
    if (isAuthRoute) {
      if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
      if (userRole === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If token is invalid/expired, clear it and redirect to login
    if (isTeacherRoute || isAdminRoute || isStudentRoute || isOnboardingRoute) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('tt_session');
      response.cookies.delete('user_session');
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/admin/:path*',
    '/student/:path*',
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup'
  ],
};
