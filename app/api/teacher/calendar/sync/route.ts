import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { syncCalendarEvents } from '@/lib/google-calendar';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch external events from Google
    const externalEvents = await syncCalendarEvents(session.userId);
    
    // 2. Map and Upsert into local DB
    const syncResults = await Promise.all(
      externalEvents.map(async (gEvent: any) => {
        // Skip events without a start time (all-day events might need different handling)
        if (!gEvent.start?.dateTime) return null;

        return prisma.calendarEvent.upsert({
          where: { externalId: gEvent.id },
          update: {
            title: gEvent.summary || 'Google Event',
            description: gEvent.description,
            startTime: new Date(gEvent.start.dateTime),
            endTime: new Date(gEvent.end.dateTime || gEvent.start.dateTime),
            meetingLink: gEvent.location || gEvent.hangoutLink || gEvent.conferenceData?.entryPoints?.[0]?.uri,
          },
          create: {
            userId: session.userId,
            externalId: gEvent.id,
            title: gEvent.summary || 'Google Event',
            description: gEvent.description,
            startTime: new Date(gEvent.start.dateTime),
            endTime: new Date(gEvent.end.dateTime || gEvent.start.dateTime),
            meetingLink: gEvent.location || gEvent.hangoutLink || gEvent.conferenceData?.entryPoints?.[0]?.uri,
            source: 'google',
            type: 'meeting'
          }
        });
      })
    );

    const syncedCount = syncResults.filter(Boolean).length;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} events from Google Calendar`,
      syncedCount
    });

  } catch (error: any) {
    console.error('❌ Google Calendar Sync API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
