export function getGitHubAuthUrl(state: string, redirectUri?: string) {
  const clientId = (process.env.GITHUB_CLIENT_ID || '').trim();
  
  if (!clientId) {
    console.error('❌ GITHUB_CLIENT_ID is missing from environment variables');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user user:email',
    state,
  });
  if (redirectUri) params.append('redirect_uri', redirectUri);
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function getGitHubTokens(code: string, redirectUri?: string) {
  const clientId = (process.env.GITHUB_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GITHUB_CLIENT_SECRET || '').trim();

  const body: any = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
  };
  if (redirectUri) body.redirect_uri = redirectUri;

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Failed to fetch GitHub tokens');
  const data = await response.json();
  if (data.error) {
    console.error('❌ [GITHUB_TOKENS_ERROR]:', data);
    throw new Error(data.error_description || data.error || 'Failed to fetch GitHub tokens');
  }
  return data;
}

export async function getGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Tech-Tomorrow',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch GitHub user');
  const user = await response.json();

  // Fetch emails if not available
  if (!user.email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Tech-Tomorrow',
      },
    });
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
      user.email = primaryEmail?.email;
      user.emailVerified = primaryEmail?.verified === true;
    }
  }

  return user;
}
