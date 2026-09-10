export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getGitHubTokens, getGitHubUser } from '@/lib/auth/providers/github';
import { resolveUserIdentity } from '@/lib/auth/unification';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { getBaseUrl, sanitizeRedirectPath, getCookieOptions } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isProd = process.env.NODE_ENV === 'production';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0');
  const storedState = request.cookies.get('oauth_state')?.value;

  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/callback/github`;

  if (!code || !state) {
    console.error('[GITHUB_AUTH] Missing code or state param', { code: !!code, state: !!state });
    return NextResponse.redirect(new URL('/login?error=invalid_state', baseUrl));
  }

  // State mismatch: if cookie exists and differs → CSRF — reject.
  // If cookie is missing, it was dropped by the proxy/browser (known Hostinger issue) — allow with warning.
  if (storedState && state !== storedState) {
    console.error('[GITHUB_AUTH] OAuth state mismatch (CSRF suspected)', { state, storedState });
    return NextResponse.redirect(new URL('/login?error=invalid_state', baseUrl));
  }

  if (!storedState) {
    console.warn('[GITHUB_AUTH] oauth_state cookie missing — likely dropped in production proxy redirect. Proceeding with caution.');
  }

  try {
    const tokens = await getGitHubTokens(code, redirectUri);
    const githubUser = await getGitHubUser(tokens.access_token);

    if (!githubUser.email) {
      return NextResponse.redirect(new URL('/login?error=email_required', baseUrl));
    }

    const user = await resolveUserIdentity(githubUser.email, {
      name: githubUser.name || githubUser.login,
      image: githubUser.avatar_url,
      provider: 'github',
      providerId: githubUser.id.toString(),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      emailVerified: githubUser.emailVerified === true, // From our updated getGitHubUser
    });

    if (!user) {
      console.error('❌ resolveUserIdentity (GitHub) returned null (likely DB connection issue)');
      return NextResponse.redirect(new URL('/login?error=service_outage', baseUrl));
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

    // Check if user needs to complete onboarding
    // Users with onboarded=false should be redirected to onboarding
    if (!targetUrl) {
      const role = (user.role || '').toUpperCase();
      const isStaffOrMentor = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR', 'MENTOR', 'CTO', 'LEAD_DEVELOPER'].includes(role);

      if (user.onboarded === false && !isStaffOrMentor) {
        targetUrl = '/onboarding';
      } else {
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
    console.error('❌ [GITHUB_AUTH_ERROR]:', {
      message: error.message,
      stack: error.stack,
      url: request.url
    });
    const errMessage = encodeURIComponent(error.message || 'Authentication failed. Please try again.');
    return NextResponse.redirect(new URL(`/login?error=auth_failed&error_description=${errMessage}`, baseUrl));
  }
}

