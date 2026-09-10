export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      console.error('YouTube OAuth callback error param:', error);
      return NextResponse.redirect(new URL('/admin?error=oauth_error', request.url));
    }

    if (!code || !state) {
      console.error('Missing code or state in YouTube OAuth callback');
      return NextResponse.redirect(new URL('/admin?error=missing_params', request.url));
    }

    // Verify user exists and is Admin
    const user = await prisma.user.findUnique({
      where: { id: state },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=not_authorized', request.url));
    }

    const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
    const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      console.error('Missing YOUTUBE credentials');
      return NextResponse.redirect(new URL('/admin?error=server_config_error', request.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
    const redirectUri = `${baseUrl}/api/admin/youtube/oauth/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('YouTube OAuth Token exchange failed:', errorText);
      return NextResponse.redirect(new URL('/admin?error=token_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('Missing access token in YouTube response');
      return NextResponse.redirect(new URL('/admin?error=missing_tokens', request.url));
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined;
    const expiryTime = new Date(Date.now() + (tokens.expires_in * 1000));

    // Save/Upsert global YouTube OAuth token
    // We'll store it under a single row with a fixed ID
    const tokenId = 'global-youtube-live-token';

    if (encryptedRefreshToken) {
      await prisma.youtubeAuthToken.upsert({
        where: { id: tokenId },
        create: {
          id: tokenId,
          refreshToken: encryptedRefreshToken,
          accessToken: encryptedAccessToken,
          expiresAt: expiryTime,
        },
        update: {
          refreshToken: encryptedRefreshToken,
          accessToken: encryptedAccessToken,
          expiresAt: expiryTime,
        }
      });
    } else {
      // If we didn't receive a refresh token (can happen if user already consented before, or prompt=consent wasn't forced)
      // retrieve existing one, update access token and expiry
      await prisma.youtubeAuthToken.upsert({
        where: { id: tokenId },
        create: {
          id: tokenId,
          refreshToken: '', // Fallback, but should have it
          accessToken: encryptedAccessToken,
          expiresAt: expiryTime,
        },
        update: {
          accessToken: encryptedAccessToken,
          expiresAt: expiryTime,
        }
      });
    }

    return NextResponse.redirect(new URL('/admin?youtube_connected=true', request.url));
  } catch (error: any) {
    console.error('YouTube OAuth callback error:', error);
    return NextResponse.redirect(new URL('/admin?error=oauth_callback_failed', request.url));
  }
}
