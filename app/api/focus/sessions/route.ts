export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/focus/sessions - Start a new focus session
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!(session as any)?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (session as any).email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { sessionType = 'study' } = body;

    // Create new focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        sessionType,
        status: 'active',
        startTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      session: focusSession,
    });
  } catch (error: any) {
    console.error('Error creating focus session:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/focus/sessions - Get user's focus sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!(session as any)?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (session as any).email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent sessions
    const sessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate total stats
    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const totalDeepWorkSeconds = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDeepWorkScore =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.deepWorkScore || 0), 0) /
          completedSessions.length
        : 0;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        totalDeepWorkHours: (totalDeepWorkSeconds / 3600).toFixed(1),
        avgEfficiency: Math.round(avgDeepWorkScore),
      },
    });
  } catch (error: any) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
}

