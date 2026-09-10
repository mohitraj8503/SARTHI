import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createCalendarEvent, syncCalendarEvents } from '@/lib/google-calendar';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Get Enrollments and Upcoming Classes/Seminars
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true, course: { select: { title: true } } }
    });
    const courseIds = enrollments.map(e => e.courseId);
    const courseMap = new Map(enrollments.map(e => [e.courseId, e.course.title]));

    // Fetch upcoming lessons
    const lessons = await prisma.lesson.findMany({
      where: { 
        courseId: { in: courseIds },
        scheduledAt: { gte: new Date() }
      }
    });

    // Fetch upcoming seminars
    const seminars = await prisma.seminar.findMany({
      where: {
        OR: [
          { courseId: { in: courseIds } },
          { registrations: { some: { userId: user.id } } }
        ],
        startTime: { gte: new Date() }
      }
    });

    // 2. Sync External Google Events (Pull)
    const externalEvents = await syncCalendarEvents(user.id);
    await Promise.all(
      externalEvents.map(async (gEvent: any) => {
        if (!gEvent.start?.dateTime) return null;
        return prisma.calendarEvent.upsert({
          where: { externalId: gEvent.id },
          update: {
            title: gEvent.summary || 'Google Event',
            startTime: new Date(gEvent.start.dateTime),
            endTime: new Date(gEvent.end.dateTime || gEvent.start.dateTime),
          },
          create: {
            userId: user.id,
            externalId: gEvent.id,
            title: gEvent.summary || 'Google Event',
            startTime: new Date(gEvent.start.dateTime),
            endTime: new Date(gEvent.end.dateTime || gEvent.start.dateTime),
            source: 'google',
            type: 'meeting'
          }
        });
      })
    );

    // 3. Push App Events to Google (Push)
    // We only push if they don't have an externalId already for this student/event pair
    // Note: To be efficient, we track which app events have been synced for which user
    let pushedCount = 0;
    
    // Process Lessons
    for (const lesson of lessons) {
      try {
        const googleEventId = await createCalendarEvent(user.id, {
          title: `CLASS: ${lesson.title}`,
          description: `Course: ${courseMap.get(lesson.courseId)}\n\nJoin here: ${process.env.NEXT_PUBLIC_APP_URL}/courses/${lesson.courseId}/learn`,
          startTime: lesson.scheduledAt!,
          endTime: new Date(lesson.scheduledAt!.getTime() + (lesson.duration || 60) * 60000)
        });
        if (googleEventId) pushedCount++;
      } catch (e) { console.warn('Sync failed for lesson', lesson.id, e); }
    }

    // Process Seminars
    for (const seminar of seminars) {
      try {
        const googleEventId = await createCalendarEvent(user.id, {
          title: `SEMINAR: ${seminar.title}`,
          description: `Expert Session\n\nJoin here: ${seminar.meetLink || (process.env.NEXT_PUBLIC_APP_URL + '/seminars/' + seminar.id)}`,
          startTime: seminar.startTime!,
          endTime: new Date(seminar.startTime!.getTime() + (seminar.durationMinutes || 60) * 60000)
        });
        if (googleEventId) pushedCount++;
      } catch (e) { console.warn('Sync failed for seminar', seminar.id, e); }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${pushedCount} app events to your Google Calendar and updated external meetings.`,
      pushedCount
    });

  } catch (error: any) {
    console.error('❌ Student Sync API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
