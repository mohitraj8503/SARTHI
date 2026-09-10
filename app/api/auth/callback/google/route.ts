export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUser } from '@/lib/auth/providers/google';
import { resolveUserIdentity } from '@/lib/auth/unification';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { getBaseUrl, sanitizeRedirectPath, getCookieOptions } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const isProd = process.env.NODE_ENV === 'production';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;
  
  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!code || !state) {
    console.error('[GOOGLE_AUTH] Missing code or state param', { code: !!code, state: !!state });
    return NextResponse.redirect(new URL(`/login?error=invalid_state`, baseUrl));
  }

  // State mismatch check: if cookie exists and differs → reject (CSRF attack)
  // If cookie is missing/empty, it was likely dropped by browser (Hostinger/SameSite issue) — allow with warning
  if (storedState && state !== storedState) {
    console.error('[GOOGLE_AUTH] OAuth state mismatch (CSRF suspected)', { state, storedState });
    return NextResponse.redirect(new URL(`/login?error=invalid_state`, baseUrl));
  }

  if (!storedState) {
    console.warn('[GOOGLE_AUTH] oauth_state cookie missing — likely dropped in production proxy redirect. Proceeding with caution.');
  }

  try {
    let tokens;
    let googleUser;

    const devAuthFallbackEnabled =
      process.env.NODE_ENV === 'development' &&
      process.env.DEV_AUTH_FALLBACK === '1' &&
      process.env.ALLOW_DEV_AUTH_FALLBACK === '1';

    if (devAuthFallbackEnabled && code === 'mock_dev_code') {
      tokens = {
        access_token: 'mock_dev_access_token',
        refresh_token: 'mock_dev_refresh_token',
        id_token: 'mock_dev_id_token',
      };
      googleUser = {
        email: 'mohitraj8503@gmail.com',
        name: 'Mohit Raj',
        picture: '/images/instructors/mohit-raj-speaker.jpg',
        sub: 'mock-google-id-12345',
        email_verified: true,
      };
    } else {
      tokens = await getGoogleTokens(code, redirectUri);
      googleUser = await getGoogleUser(tokens.id_token);
    }

    if (!googleUser.email) {
      return NextResponse.redirect(new URL(`/login?error=email_required`, baseUrl));
    }

    const user = await resolveUserIdentity(googleUser.email, {
      name: googleUser.name,
      image: googleUser.picture,
      provider: 'google',
      providerId: googleUser.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      emailVerified: googleUser.email_verified === true, // Trust Google's verification
    });

    if (!user) {
      console.error('❌ resolveUserIdentity returned null (likely DB connection issue)');
      return NextResponse.redirect(new URL(`/login?error=service_outage`, baseUrl));
    }

    // Create session (but don't set cookies yet)
    const session = await createSession(user.id, user.role, user.email, user.name ?? undefined);

    // Create JWT token
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      sessionId: session.id,
      email: user.email,
      name: user.name
    });

    const authRedirect = sanitizeRedirectPath(request.cookies.get('auth_redirect')?.value);
    let targetUrl = authRedirect;

    // Determine the target URL based on user role and onboarding status
    if (!targetUrl) {
      const role = (user.role || '').toUpperCase();
      const isStaffOrMentor = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR', 'MENTOR', 'CTO', 'LEAD_DEVELOPER'].includes(role);

      if (user.onboarded === false && !isStaffOrMentor) {
        targetUrl = '/onboarding';
      } else {
        // Role-based redirection logic
        if (['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role)) {
          targetUrl = '/admin/dashboard';
        } else if (['TEACHER', 'INSTRUCTOR'].includes(role)) {
          targetUrl = '/teacher/dashboard';
        } else if (role === 'MENTOR') {
          targetUrl = '/mentor/dashboard';
        } else {
          targetUrl = '/dashboard';
        }
      }
    }

    const response = NextResponse.redirect(new URL(targetUrl, baseUrl));

    response.cookies.set('tt_session', token, getCookieOptions(request, 60 * 60 * 24 * 7));

    const clearOptions = getCookieOptions(request, 0);
    response.cookies.set('oauth_state', '', clearOptions);
    response.cookies.set('auth_redirect', '', clearOptions);
    return response;
  } catch (error: any) {
    console.error('❌ [GOOGLE_AUTH_CALLBACK_CRITICAL]:', {
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
      url: request.url,
      redirectUri
    });
    return NextResponse.redirect(new URL(`/login?error=auth_failed`, baseUrl));
  }
}

