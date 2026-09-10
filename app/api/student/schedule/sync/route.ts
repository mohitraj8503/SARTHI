import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { syncCalendarEvents } from '@/lib/google-calendar';
import { clearResiliencyCache } from '@/lib/resilient-db';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connection = await prisma.calendarConnection.findUnique({
      where: { userId: user.id }
    });

    if (!connection) {
      return NextResponse.json({ error: 'No calendar connected' }, { status: 400 });
    }

    const gEvents = await syncCalendarEvents(user.id);
    
    // Sync to DB
    const syncPromises = gEvents.map(async (event) => {
      if (!event.start?.dateTime || !event.summary) return;

      return prisma.calendarEvent.upsert({
        where: { externalId: event.id! },
        create: {
          userId: user.id,
          title: event.summary,
          description: event.description,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end?.dateTime || event.start.dateTime),
          type: 'meeting', // Default type for Google events
          source: 'google',
          externalId: event.id!
        },
        update: {
          title: event.summary,
          description: event.description,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end?.dateTime || event.start.dateTime),
        }
      });
    });

    await Promise.all(syncPromises);

    clearResiliencyCache(`user_schedule_v2_${user.id}`);

    return NextResponse.json({ success: true, count: gEvents.length });
  } catch (error: any) {
    console.error('Calendar Sync Error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
