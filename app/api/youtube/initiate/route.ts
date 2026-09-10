export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Use the centralized auth helper (reads tt_session cookie correctly)
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.redirect(new URL('/login?error=not_authenticated', request.url));
        }

        // Google OAuth configuration for YouTube
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID;
        if (!GOOGLE_CLIENT_ID) {
            console.error('Missing Google OAuth credentials');
            return NextResponse.redirect(new URL('/login?error=server_config_error', request.url));
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
        const redirectUri = `${baseUrl}/api/youtube/callback`;
        const scope = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.upload',
        ].join(' ');

        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scope)}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${encodeURIComponent(user.id)}`; // Pass user ID in state

        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('YouTube OAuth initiate error:', error);
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }
}

