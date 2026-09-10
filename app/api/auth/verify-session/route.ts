export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('tt_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session exists and belongs to user
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            onboarded: true,
            status: true,
          }
        }
      }
    });

    if (
      !session ||
      session.userId !== payload.userId ||
      !session.isValid ||
      (session.expires && session.expires < new Date()) ||
      session.user.status === 'DISABLED'
    ) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      emailVerified: session.user.emailVerified,
      onboarded: session.user.onboarded,
      status: session.user.status,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

