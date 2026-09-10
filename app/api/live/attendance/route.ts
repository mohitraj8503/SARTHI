import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, status } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
    }

    // Upsert attendance record
    const attendance = await prisma.liveAttendance.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      update: {
        lastJoinedAt: new Date(),
        status: status || 'JOINED'
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        joinedAt: new Date(),
        lastJoinedAt: new Date(),
        status: status || 'JOINED'
      }
    });

    // Update student progress for this course/lesson
    // (Logic for progress can be added here)

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('[LIVE_ATTENDANCE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

