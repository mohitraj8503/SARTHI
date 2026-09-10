import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const userId = await authenticateTeacher(req);

    const body = await req.json();
    const { 
      courseId, 
      title, 
      description, 
      scheduledStartTime, 
      durationMinutes, 
      privacy, 
      recordingEnabled,
      lessonId,
      moduleId,
      orderNumber,
      isRequired,
      prerequisiteLessonIds 
    } = body;

    // 1. Validation
    if (!courseId || !title || !scheduledStartTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Since we don't have a coTeachers relation mapped natively yet in the model, we check instructorId/teacherId.
    // In this model, course has instructorId (String) and teacherId (String?).
    // We check against both.
    const courseOwnerIds = [course.teacherId, (course as any).instructorId].filter(Boolean);
    if (!courseOwnerIds.includes(userId)) {
        return NextResponse.json({ error: 'Unauthorized to schedule sessions for this course' }, { status: 403 });
    }

    // Validate curriculum link if provided
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: true }
      });
      if (!lesson || lesson.courseId !== courseId) {
        return NextResponse.json({ error: 'Linked lesson not found in this course' }, { status: 400 });
      }
      if (!['live-session', 'interactive-live', 'qa-live'].includes(lesson.contentType)) {
          return NextResponse.json({ error: 'Lesson type does not support live session linkage' }, { status: 400 });
      }
    }

    if (moduleId) {
      const existingModule = await prisma.module.findUnique({
        where: { id: moduleId }
      });
      if (!existingModule || existingModule.courseId !== courseId) {
        return NextResponse.json({ error: 'Module not found in this course' }, { status: 400 });
      }
    }

    // 2. Creation
    const roomId = `room_${crypto.randomBytes(8).toString('hex')}`;
    
    // Create live session
    const liveSession = await prisma.liveSession.create({
      data: {
        teacherId: userId,
        courseId,
        title,
        description,
        startTime: new Date(scheduledStartTime),
        endTime: new Date(new Date(scheduledStartTime).getTime() + (durationMinutes || 60) * 60000),
        durationMinutes: durationMinutes || 60,
        privacy: privacy || 'enrolled',
        recordingEnabled: recordingEnabled ?? true,
        status: 'scheduled',
        roomId,
        
        // Curriculum links
        lessonId,
        moduleId,
        orderNumber,
        isRequired: isRequired ?? false,
      }
    });

    // 3. Post-Creation Linkage
    if (lessonId) {
      await prisma.lesson.update({
        where: { id: lessonId },
        data: { liveSessionId: liveSession.id }
      });
    }

    // 4. Google Calendar Sync
    try {
      const { createCalendarEvent } = await import('@/lib/google-calendar');
      const googleEventId = await createCalendarEvent(userId, {
        title: `LIVE: ${title}`,
        description: `${description || ''}\n\nJoin Link: ${process.env.NEXT_PUBLIC_APP_URL}/live/${liveSession.id}`,
        startTime: liveSession.startTime,
        endTime: liveSession.endTime,
        meetingLink: `${process.env.NEXT_PUBLIC_APP_URL}/live/${liveSession.id}`
      });

      if (googleEventId) {
        await prisma.calendarEvent.create({
          data: {
            userId: userId,
            title: `LIVE: ${title}`,
            description,
            startTime: liveSession.startTime,
            endTime: liveSession.endTime,
            type: 'live-session',
            externalId: googleEventId,
            source: 'google',
            courseId: courseId,
            meetingLink: `${process.env.NEXT_PUBLIC_APP_URL}/live/${liveSession.id}`
          }
        });
      }
    } catch (gError) {
      console.warn('⚠️ Live Session Google Sync failed:', gError);
    }

    // REALTIME: Emit event to notify students
    try {
      const { eventBus } = await import('@/lib/realtime/event-bus');
      eventBus.emitEvent({
        eventId: `live-${liveSession.id}`,
        version: '1.0',
        source: 'api/teacher/live-sessions',
        timestamp: new Date().toISOString(),
        type: 'LIVE_SESSION_CREATED',
        metadata: { actorId: userId },
        payload: {
          entity: 'live_session',
          action: 'CREATE',
          id: liveSession.id,
          after: liveSession
        }
      });
    } catch (e) {
      console.warn('Realtime event emission failed:', e);
    }

    return NextResponse.json({ success: true, liveSession });
  } catch (error: any) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error instanceof AuthenticationError ? 401 : 403 });
    }
    console.error('[LIVE_SESSION_CREATE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

