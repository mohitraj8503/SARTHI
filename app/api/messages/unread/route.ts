export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const token = cookieStore.get('tt_session')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const userId = payload.userId;

    // Count unread messages (with resiliency)
    const result = await withResiliency(async () => {
      return await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });
    }, `unread-${userId}`);

    const unreadCount = result.data ?? 0;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Get unread messages count error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

