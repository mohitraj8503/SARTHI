import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await withResiliency(async () => {
    // 1. Get user enrollments to know which courses to fetch for
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true, course: { select: { title: true } } }
    });
    const courseIds = enrollments.map(e => e.courseId);
    const courseMap = new Map(enrollments.map(e => [e.courseId, e.course.title]));

    // 2. Fetch Seminars
    const seminars = await prisma.seminar.findMany({
      where: {
        OR: [
          { courseId: { in: courseIds } },
          { registrations: { some: { userId: user.id } } }
        ],
        status: { not: 'DRAFT' }
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        durationMinutes: true,
        meetLink: true,
        status: true,
        courseId: true
      }
    });

    // 3. Fetch Assignments
    const assignments = await prisma.assignment.findMany({
      where: { lesson: { courseId: { in: courseIds } } },
      include: { 
        lesson: { select: { courseId: true } },
        submissions: { where: { userId: user.id }, select: { status: true } }
      }
    });

    // 4. Fetch Scheduled Lessons (Course Sessions)
    const lessons = await prisma.lesson.findMany({
      where: { 
        courseId: { in: courseIds },
        scheduledAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        courseId: true,
        type: true
      }
    });

    // 5. Fetch Calendar Events (Meetings & Synced Google Events)
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: { 
        OR: [
          { courseId: { in: courseIds } },
          { userId: user.id }
        ]
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        type: true,
        meetingLink: true,
        courseId: true,
        source: true
      }
    });

    // 6. Check Calendar Connection Status
    const calendarConnection = await prisma.calendarConnection.findUnique({
      where: { userId: user.id },
      select: { id: true, provider: true }
    });

    // 7. Normalize into Timeline Events with Real-Time Logic
    const events: any[] = [];
    const nowTs = Date.now();

    // Process Seminars
    seminars.forEach(s => {
      const startTs = new Date(s.startTime || s.date).getTime();
      const endTs = s.startTime ? startTs + (s.durationMinutes || 60) * 60000 : startTs + 3600000;
      const isLive = nowTs >= startTs && nowTs <= endTs;

      events.push({
        id: s.id,
        type: 'seminar',
        title: s.title,
        courseName: s.courseId ? courseMap.get(s.courseId) : 'Special Seminar',
        start: s.startTime || s.date,
        end: new Date(endTs),
        status: isLive ? 'live' : (s.status.toLowerCase() === 'live' ? 'live' : 'upcoming'),
        priority: 'high',
        actionUrl: s.meetLink || `/seminars/${s.id}`,
        instructor: 'Academy Expert',
        instructorImage: null
      });
    });

    // Process Assignments
    assignments.forEach(a => {
      const isCompleted = a.submissions.some(s => s.status === 'graded' || s.status === 'submitted');
      events.push({
        id: a.id,
        type: 'assignment',
        title: a.title,
        courseName: courseMap.get(a.lesson.courseId),
        start: a.dueDate,
        end: a.dueDate,
        status: isCompleted ? 'completed' : 'pending',
        priority: 'high',
        actionUrl: `/courses/${a.lesson.courseId}/learn`,
        instructor: 'Course Faculty',
        instructorImage: null
      });
    });

    // Process Lessons
    lessons.forEach(l => {
      const startTs = new Date(l.scheduledAt!).getTime();
      const endTs = startTs + (l.duration || 60) * 60000;
      const isLive = nowTs >= startTs && nowTs <= endTs;

      events.push({
        id: l.id,
        type: 'class',
        title: l.title,
        courseName: courseMap.get(l.courseId),
        start: l.scheduledAt,
        end: new Date(endTs),
        status: isLive ? 'live' : 'upcoming',
        priority: 'medium',
        actionUrl: `/courses/${l.courseId}/learn`,
        instructor: 'Course Faculty',
        instructorImage: null
      });
    });

    // Process Calendar Events
    calendarEvents.forEach(e => {
      const startTs = new Date(e.startTime).getTime();
      const endTs = new Date(e.endTime).getTime();
      const isLive = nowTs >= startTs && nowTs <= endTs;

      events.push({
        id: e.id,
        type: e.source === 'google' ? 'meeting' : (e.type.toLowerCase().includes('meeting') ? 'meeting' : 'class'),
        title: e.title,
        courseName: e.courseId ? courseMap.get(e.courseId) : (e.source === 'google' ? 'Google Calendar' : 'General'),
        start: e.startTime,
        end: e.endTime,
        status: isLive ? 'live' : (e.source === 'google' ? 'scheduled' : 'upcoming'),
        priority: e.source === 'google' ? 'medium' : 'high',
        actionUrl: e.meetingLink || '#',
        instructor: 'Event Host',
        instructorImage: null
      });
    });

    // Sort by date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return { 
      events, 
      calendarConnected: !!calendarConnection,
      lastSyncedAt: new Date().toISOString(),
      meta: {
        total: events.length,
        live: events.filter(e => e.status === 'live').length
      }
    };
  }, `user_schedule_v2_${user.id}`);

  if (!result.success) {
    return NextResponse.json({ 
      success: false, 
      events: [], 
      error: result.error || 'DB_OFFLINE',
      lastSyncedAt: new Date().toISOString() 
    });
  }

  return NextResponse.json({
    success: true,
    ...result.data
  });
}
