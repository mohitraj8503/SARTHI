import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date();
    const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date(Date.now() + 30*24*60*60*1000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: session.userId,
        startTime: { gte: start, lte: end },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: { events: events || [] }
    });

  } catch (error: any) {
    console.error(`❌ API Error /api/teacher/calendar/events:`, error);
    return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, type, meetingLink, courseId } = body;

    // 1. Create in local DB
    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: type || 'meeting',
        meetingLink,
        courseId
      },
    });

    // 2. Sync to Google Calendar
    try {
      const googleEventId = await createCalendarEvent(session.userId, {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingLink
      });

      if (googleEventId) {
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { externalId: googleEventId, source: 'google' }
        });
      }
    } catch (gError) {
      console.warn('⚠️ Google Calendar Sync failed (Create):', gError);
    }

    return NextResponse.json({
      success: true,
      data: { event },
      message: 'Event created and synced'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, title, description, startTime, endTime } = body;

    const event = await prisma.calendarEvent.update({
      where: { id, userId: session.userId },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });

    if (event.externalId) {
      try {
        await updateCalendarEvent(session.userId, event.externalId, {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        });
      } catch (gError) {
        console.warn('⚠️ Google Calendar Sync failed (Update):', gError);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const event = await prisma.calendarEvent.findUnique({
      where: { id, userId: session.userId }
    });

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (event.externalId) {
      try {
        await deleteCalendarEvent(session.userId, event.externalId);
      } catch (gError) {
        console.warn('⚠️ Google Calendar Sync failed (Delete):', gError);
      }
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
