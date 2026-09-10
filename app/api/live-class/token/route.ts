import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { livekit } from '@/lib/livekit';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/live-class/token
 *
 * Generates a LiveKit access token for the calling user to join a live class.
 *
 * Security:
 *  - Rate-limited: 10 token requests per user per 60 seconds (prevents billing abuse)
 *  - Students must have an active Enrollment (status = 'active')
 *  - Joining ENDED or CANCELLED classes is blocked
 *  - Teacher role is derived server-side from DB — never from client input
 *  - Token TTL is 6 hours for live-class tokens (avoids mid-class expiry)
 *
 * Body: { liveClassId }
 * Returns: { token, serverUrl, roomName, role }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // A1: Rate-limit 10 token requests per user per minute
    const rl = await checkRateLimit(`live-class-token:${session.userId}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many join attempts. Please wait a moment and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();
    const { liveClassId, seminarId } = body;

    if (!liveClassId && !seminarId) {
      return NextResponse.json({ error: 'liveClassId or seminarId is required' }, { status: 400 });
    }

    let roomName = '';
    let title = '';
    let targetId = '';
    let role: 'teacher' | 'student' = 'student';

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, name: true, email: true, avatar_url: true },
    });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    const isTeacherRole = user?.role === 'TEACHER' || user?.role === 'INSTRUCTOR';

    if (seminarId) {
      const seminar = await prisma.seminar.findFirst({
        where: { OR: [{ id: seminarId }, { slug: seminarId }] },
        select: { id: true, title: true, instructorId: true, status: true, registrationRequired: true }
      });

      if (!seminar) {
        return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
      }

      roomName = `seminar_${seminar.id}`;
      title = seminar.title;
      targetId = seminar.id;

      if (isAdmin || isTeacherRole || seminar.instructorId === session.userId) {
        role = 'teacher';
      } else {
        // Seminars: If registration is required, student must have a SeminarRegistration record.
        // If registration is NOT required (open seminar), any logged-in user can join!
        if (seminar.registrationRequired) {
          const registration = await prisma.seminarRegistration.findFirst({
            where: { seminarId: seminar.id, userId: session.userId }
          });
          if (!registration && !isAdmin) {
            return NextResponse.json({ error: 'You must be registered for this seminar to join' }, { status: 403 });
          }
        }
      }
    } else {
      const liveClass = await prisma.liveClass.findUnique({
        where: { id: liveClassId },
        select: {
          id: true,
          courseId: true,
          teacherId: true,
          title: true,
          roomName: true,
          liveKitStatus: true,
          status: true,
          isLocked: true,
        },
      });

      if (!liveClass) {
        return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
      }

      if (!liveClass.roomName) {
        return NextResponse.json({ error: 'This is not a LiveKit-enabled class' }, { status: 400 });
      }

      if (liveClass.liveKitStatus === 'CANCELLED') {
        return NextResponse.json({ error: 'This class has been cancelled' }, { status: 410 });
      }
      if (liveClass.liveKitStatus === 'ENDED') {
        return NextResponse.json(
          { error: 'This class has ended. Watch the recording from the course page.' },
          { status: 410 }
        );
      }

      roomName = liveClass.roomName;
      title = liveClass.title;
      targetId = liveClass.id;

      if (isAdmin || isTeacherRole || liveClass.teacherId === session.userId) {
        if (!isAdmin) {
          const teacher = await prisma.teacher.findUnique({
            where: { userId: session.userId },
            select: { id: true },
          });
          if (!teacher && !isTeacherRole) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 403 });
          }
        }
        role = 'teacher';
      } else {
        if (liveClass.isLocked) {
          return NextResponse.json(
            { error: 'This room has been locked by the host. No new entries are allowed.' },
            { status: 423 }
          );
        }

        const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.userId, courseId: liveClass.courseId } },
          select: { status: true },
        });

        if (!enrollment || enrollment.status.toLowerCase() !== 'active') {
          return NextResponse.json(
            { error: 'You must be actively enrolled in this course to join the live class.' },
            { status: 403 }
          );
        }
      }
    }

    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_WS_URL;
    if (!serverUrl) {
      return NextResponse.json({ error: 'LiveKit server URL is not configured' }, { status: 500 });
    }

    // A1: roomAdmin/roomRecord grants are set by the token helper based on role — never from client
    // Token TTL is 6 hours for live classes (avoids mid-class JWT expiry for long sessions)
    const token = await livekit.generateToken({
      roomName,
      userId: session.userId,
      userName: user?.name || user?.email || session.userId,
      role,
      avatarUrl: user?.avatar_url || undefined,
    });

    return NextResponse.json({
      success: true,
      token,
      serverUrl,
      roomName,
      liveClassId: targetId,
      role,
      title,
    });
  } catch (error: any) {
    console.error('TOKEN_ROUTE_ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error), 
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}
