export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=not_authorized', request.url));
    }

    const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
    if (!YOUTUBE_CLIENT_ID) {
      console.error('Missing YOUTUBE_CLIENT_ID credentials');
      return NextResponse.redirect(new URL('/admin?error=youtube_config_error', request.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
    const redirectUri = `${baseUrl}/api/admin/youtube/oauth/callback`;
    const scope = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' ');

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${YOUTUBE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(user.id)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('YouTube OAuth initiate error:', error);
    return NextResponse.redirect(new URL('/admin?error=oauth_failed', request.url));
  }
}
