export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // userId passed in state
        const error = searchParams.get('error');

        if (error) {
            console.error('YouTube OAuth error:', error);
            return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
        }

        if (!code || !state) {
            console.error('Missing code or state in YouTube callback');
            return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: state },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
        const redirectUri = `${baseUrl}/api/youtube/callback`;

        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET;

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            console.error('Missing Google OAuth credentials');
            return NextResponse.redirect(new URL('/login?error=server_config_error', request.url));
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('YouTube Token exchange failed:', errorText);
            return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
        }

        const tokens = await tokenResponse.json();

        if (!tokens.access_token || !tokens.refresh_token) {
            console.error('Missing tokens in response');
            return NextResponse.redirect(new URL('/login?error=missing_tokens', request.url));
        }

        // Calculate expiry time (tokens.expires_in is in seconds)
        const expiryTime = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

        // Encrypt tokens
        const encryptedAccessToken = encrypt(tokens.access_token);
        const encryptedRefreshToken = encrypt(tokens.refresh_token);
        const encryptedExpiry = encrypt(expiryTime);

        // Fetch authenticated user's YouTube Channel ID
        let youtubeChannelId = null;
        let youtubeChannelTitle = null;

        try {
            const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });
            if (channelRes.ok) {
                const channelData = await channelRes.json();
                if (channelData.items && channelData.items.length > 0) {
                    youtubeChannelId = channelData.items[0].id;
                    youtubeChannelTitle = channelData.items[0].snippet.title;
                }
            }
        } catch (channelErr) {
            console.error('Failed to fetch YouTube channel info during callback:', channelErr);
            // Non-fatal, tokens are still saved, but mapping will prevent uploads until fixed
        }

        // Store encrypted tokens and channel ID in user record
        await prisma.user.update({
            where: { id: user.id },
            data: {
                youtubeAccessToken: encryptedAccessToken,
                youtubeRefreshToken: encryptedRefreshToken,
                youtubeTokenExpiry: encryptedExpiry,
                youtubeChannelId,
                youtubeChannelTitle,
            },
        });

        // Write Audit Log
        if (youtubeChannelId) {
            try {
                const { logYouTubeAudit } = await import('@/lib/youtube-audit');
                await logYouTubeAudit({
                    teacherId: user.id,
                    action: 'CHANNEL_CONNECTED',
                    status: 'SUCCESS',
                    metadata: { youtubeChannelId, youtubeChannelTitle },
                });
            } catch (auditErr) {
                console.warn('Audit log write failed for CHANNEL_CONNECTED', auditErr);
            }
        }

        // Determine redirect URL based on user role
        let redirectUrl = '/dashboard';
        const normalizedRole = user.role?.toUpperCase();
        if (normalizedRole === 'ADMIN') {
            redirectUrl = '/admin';
        } else if (normalizedRole === 'INSTRUCTOR' || normalizedRole === 'TEACHER') {
            redirectUrl = '/teacher/dashboard';
        }

        return NextResponse.redirect(new URL(`${redirectUrl}?youtube_connected=true`, request.url));
    } catch (error: any) {
        console.error('YouTube OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url));
    }
}

