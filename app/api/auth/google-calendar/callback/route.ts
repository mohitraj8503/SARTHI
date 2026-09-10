import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { clearResiliencyCache } from '@/lib/resilient-db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  const user = await getCurrentUser();
  if (!user || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/live?error=auth_failed`);
  }

  try {
    const tokens = await getTokens(code);
    
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

    const redirectPath = user.role === 'TEACHER' ? '/dashboard/live' : '/dashboard/schedule';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}?success=calendar_linked`);
  } catch (error) {
    console.error('Google Calendar OAuth Error:', error);
    const redirectPath = user.role === 'TEACHER' ? '/dashboard/live' : '/dashboard/schedule';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}?error=sync_failed`);
  }
}
