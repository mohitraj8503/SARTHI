export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        scheduledAt: true,
        speakerName: true,
        slug: true,
      },
    });

    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    const startDate = seminar.scheduledAt || seminar.date;
    if (!startDate) {
      return NextResponse.json({ error: 'No event date found' }, { status: 400 });
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

    const formatICSDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SARTHI//Seminar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:seminar-${seminar.id}@sarthi-woad.vercel.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${seminar.title}`,
      `DESCRIPTION:${(seminar.description || '').replace(/\n/g, '\\n')}`,
      `ORGANIZER;CN=${seminar.speakerName || 'SARTHI'}:MAILTO:hello@sarthi-woad.vercel.app`,
      `URL:https://sarthi-woad.vercel.app/seminars/${seminar.slug || seminar.id}/live`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Seminar starts in 30 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${seminar.slug || seminar.id}.ics"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[SEMINAR_ICS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 });
  }
}
