import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/live-classes/[liveClassId]/attendance
 *
 * Returns student attendance logs for a live class (teacher/admin only).
 */
export async function GET(
  _req: Request,
  { params }: { params: { liveClassId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { liveClassId } = params;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: { id: true, teacherId: true, title: true },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const attendances = await prisma.liveClassAttendance.findMany({
      where: { liveClassId },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const attendanceReport = attendances.map((a) => {
      const leftTime = a.leftAt ? a.leftAt.getTime() : Date.now();
      const durationMins = Math.max(1, Math.round((leftTime - a.joinedAt.getTime()) / 60000));
      return {
        ...a,
        durationMins,
      };
    });

    return NextResponse.json({
      success: true,
      liveClassTitle: liveClass.title,
      totalParticipants: attendances.length,
      attendances: attendanceReport,
    });
  } catch (error: any) {
    console.error('[teacher/live-classes/attendance]', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
