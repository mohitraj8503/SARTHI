import { prisma } from '@/lib/prisma';

/**
 * Get Central Google Drive Token (mohitraj8503@gmail.com)
 * Teachers NO LONGER connect their own accounts for course materials.
 * This ensures platform control over content.
 */
export async function getValidGoogleToken() {
  // 1. Try to find the central account in DB
  let account = await prisma.googleAccount.findFirst({
    where: { email: 'mohitraj8503@gmail.com' }
  });

  // 2. If not in DB but refresh token is in ENV, we can use that
  const envRefreshToken = process.env.CENTRAL_DRIVE_REFRESH_TOKEN;
  const clientId = process.env.CENTRAL_DRIVE_CLIENT_ID || process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.CENTRAL_DRIVE_CLIENT_SECRET || process.env.GOOGLE_DRIVE_CLIENT_SECRET;

  if (!account && envRefreshToken) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: envRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokens = await res.json();
    if (!tokens.error) {
      account = await prisma.googleAccount.create({
        data: {
          googleUserId: 'SYSTEM_CENTRAL',
          email: 'mohitraj8503@gmail.com',
          accessToken: tokens.access_token,
          refreshToken: envRefreshToken,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          isConnected: true
        }
      });
    }
  }

  if (!account) {
    console.error('❌ Central Google Drive account not configured');
    return null;
  }

  const expiresIn = new Date(account.tokenExpiresAt).getTime() - Date.now();
  
  if (expiresIn < 10 * 60 * 1000) {
    // Refresh central token
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: account.refreshToken!,
        grant_type: 'refresh_token',
      }),
    });

    const newTokens = await res.json();
    
    if (newTokens.error) {
      console.error('❌ Failed to refresh central Google token:', newTokens.error);
      return null;
    }
    
    await prisma.googleAccount.update({
      where: { id: account.id },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || account.refreshToken,
        tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      }
    });
    
    return newTokens.access_token;
  }
  return account.accessToken;
}
