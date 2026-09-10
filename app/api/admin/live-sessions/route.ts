import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * Admin Live Session Management API
 */
export async function GET() {
  try {
    const session = await getSession();
    // Strict Admin Check
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const liveSessions = await prisma.liveSession.findMany({
      include: {
        course: { select: { title: true } },
        teacher: { select: { user: { select: { name: true } } } },
        attendance: true,
        recording: true
      },
      orderBy: { startTime: 'desc' }
    });

    const formatted = liveSessions.map(s => ({
      id: s.id,
      title: s.title,
      course: s.course.title,
      teacher: s.teacher.user.name,
      status: s.status,
      startTime: s.startTime,
      actualStart: s.actualStart,
      attendanceCount: s.attendance.length,
      hasRecording: !!s.recording,
      recordingStatus: s.recording?.status || 'none',
      meetingLink: s.meetingLink
    }));

    return NextResponse.json({ success: true, sessions: formatted });

  } catch (error: any) {
    console.error('❌ Admin Live API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

