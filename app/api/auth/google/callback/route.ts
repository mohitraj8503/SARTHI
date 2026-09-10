import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { clearResiliencyCache } from '@/lib/resilient-db';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  const user = await getCurrentUser();
  if (!user || !code) {
    return NextResponse.redirect(`${origin}/dashboard/live?error=auth_failed`);
  }

  try {
    const tokens = await getTokens(code, origin);
    
    // Save tokens to DB
    await prisma.calendarConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
        provider: 'google'
      },
      update: {
        accessToken: tokens.access_token!,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
      }
    });

    // Clear schedule cache to display connected state immediately
    clearResiliencyCache(`user_schedule_v2_${user.id}`);

    const redirectPath = '/dashboard/live';
    return NextResponse.redirect(`${origin}${redirectPath}?success=calendar_linked`);
  } catch (error) {
    console.error('Google Calendar OAuth Error:', error);
    const redirectPath = '/dashboard/live';
    return NextResponse.redirect(`${origin}${redirectPath}?error=sync_failed`);
  }
}
