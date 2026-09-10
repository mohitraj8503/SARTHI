export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/focus/sessions/[id] - Update session status (pause, resume, complete)
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getCurrentUser();

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, deepWorkScore } = body;

    // Verify session belongs to user
    const focusSession = await prisma.focusSession.findUnique({
      where: { id },
    });

    if (!focusSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (focusSession.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate duration if completing
    let duration = focusSession.duration;
    let endTime = focusSession.endTime;

    if (status === 'completed') {
      const now = new Date();
      endTime = now;
      duration = Math.floor((now.getTime() - focusSession.startTime.getTime()) / 1000);
    }

    // Update session
    const updatedSession = await prisma.focusSession.update({
      where: { id },
      data: {
        status,
        ...(deepWorkScore !== undefined && { deepWorkScore }),
        ...(duration !== null && { duration }),
        ...(endTime !== null && { endTime }),
      },
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error: any) {
    console.error('Error updating focus session:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    );
  }
}
