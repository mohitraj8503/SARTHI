import { OAuth2Client } from 'google-auth-library';

export function getGoogleClientId(): string {
  return (process.env.GOOGLE_CLIENT_ID || '').trim();
}

export function getGoogleClientSecret(): string {
  return (process.env.GOOGLE_CLIENT_SECRET || '').trim();
}

export function getOAuth2Client(): OAuth2Client {
  return new OAuth2Client(getGoogleClientId());
}

export function getGoogleAuthUrl(state: string, redirectUri: string, prompt: string = 'select_account') {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: prompt || 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getGoogleTokens(code: string, redirectUri: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to fetch Google tokens');
  }
  return response.json();
}

export async function verifyGoogleIdToken(idToken: string) {
  try {
    const client = getOAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: getGoogleClientId(),
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google ID token payload');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  } catch (error: any) {
    console.error('[Google Auth] Verification failed:', error.message);
    throw new Error('Failed to verify Google ID token');
  }
}

// Keeping getGoogleUser for backward compatibility but redirecting to verifyGoogleIdToken
export async function getGoogleUser(idToken: string) {
  return verifyGoogleIdToken(idToken);
}
