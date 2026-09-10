import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { findSessionByAnyId } from '@/lib/session-utils';

/**
 * Attendance Tracking API
 * Handles join/leave events for live sessions
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomName, action } = await req.json();
    if (!roomName) return NextResponse.json({ error: 'Room name is required' }, { status: 400 });

    // Robust lookup using utility
    const sessionMatch = await findSessionByAnyId(roomName);

    if (!sessionMatch) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    // Ensure we have a LiveSession ID to link to
    let liveSessionId: string;
    if (sessionMatch.type === 'liveSession') {
      liveSessionId = (sessionMatch.data as any).id;
    } else {
      // For lessons, we find the associated LiveSession or create one (similar to token API)
      const lesson = sessionMatch.data as any;
      let liveSession = await prisma.liveSession.findUnique({
        where: { roomId: roomName }
      });

      if (!liveSession) {
         // Create a shadow LiveSession for curriculum attendance tracking
         liveSession = await prisma.liveSession.create({
            data: {
              roomId: roomName,
              meetingLink: roomName,
              title: lesson.title,
              courseId: lesson.courseId,
              lessonId: lesson.id,
              startTime: lesson.scheduledAt || new Date(),
              endTime: new Date(Date.now() + 60 * 60000),
              status: 'live',
              teacherId: (await prisma.teacher.findFirst({ where: { courses: { some: { id: lesson.courseId } } } }))?.id || '',
            }
         });
      }
      liveSessionId = liveSession.id;
    }

    if (action === 'join') {
      // Reconnection-aware join logic
      const attendance = await prisma.sessionAttendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: liveSessionId,
            studentId: session.userId,
          },
        },
        update: {
          attendanceStatus: 'present',
          // We don't overwrite joinedAt to preserve original entry time
          // But we could track lastActive if needed
        },
        create: {
          sessionId: liveSessionId,
          studentId: session.userId,
          joinedAt: new Date(),
          attendanceStatus: 'present',
        },
      });

      // Update total attendance count
      const uniqueCount = await prisma.sessionAttendance.count({
        where: { sessionId: liveSessionId },
      });
      
      await prisma.liveSession.update({
        where: { id: liveSessionId },
        data: { attendanceCount: uniqueCount }
      });

      return NextResponse.json({ success: true, attendanceId: attendance.id });
    } 
    
    if (action === 'leave') {
      const attendance = await prisma.sessionAttendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: liveSessionId,
            studentId: session.userId,
          },
        },
      });

      if (attendance) {
        const leftAt = new Date();
        const sessionDurationMs = leftAt.getTime() - attendance.joinedAt.getTime();
        const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);

        await prisma.sessionAttendance.update({
          where: { id: attendance.id },
          data: {
            leftAt,
            // Update duration only if it's longer than before (for simple case)
            // Or better: accumulate. For now, simple update of latest leftAt.
            durationMinutes: sessionDurationMinutes,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Attendance API Error:', error);
    return NextResponse.json({ error: 'Failed to track attendance' }, { status: 500 });
  }
}

