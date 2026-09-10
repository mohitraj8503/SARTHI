export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAuthUrl } from '@/lib/auth/providers/github';
import { getBaseUrl, sanitizeRedirectPath, getCookieOptions } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirect = sanitizeRedirectPath(searchParams.get('redirect'));
  // Generate random state for CSRF protection
  const state = require('crypto').randomBytes(16).toString('hex');

  const baseUrl = getBaseUrl(request);

  // Check if user is ALREADY authenticated — if so, redirect straight to dashboard
  const token = request.cookies.get('tt_session')?.value || request.cookies.get('user_session')?.value;
  if (token) {
    try {
      const { verifyJWT } = await import('@/lib/auth/jwt');
      const payload = await verifyJWT(token);
      if (payload?.userId) {
        const role = (payload.role || 'STUDENT').toUpperCase();
        let targetUrl = redirect;
        if (!targetUrl) {
          if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'GOD_ADMIN') {
            targetUrl = '/admin/dashboard';
          } else if (role === 'TEACHER' || role === 'INSTRUCTOR') {
            targetUrl = '/teacher/dashboard';
          } else if (role === 'MENTOR') {
            targetUrl = '/mentor/dashboard';
          } else {
            targetUrl = '/dashboard';
          }
        }
        return NextResponse.redirect(new URL(targetUrl, baseUrl));
      }
    } catch {
      // Token invalid/expired, continue to GitHub login
    }
  }

  const redirectUri = `${baseUrl}/api/auth/callback/github`;

  const response = NextResponse.redirect(getGitHubAuthUrl(state, redirectUri));

  // Store state in a cookie for validation in callback
  response.cookies.set('oauth_state', state, getCookieOptions(request, 60 * 15));

  if (redirect) {
    response.cookies.set('auth_redirect', redirect, getCookieOptions(request, 60 * 10));
  }

  return response;
}

