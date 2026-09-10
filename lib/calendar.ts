/**
 * Generates an ICS file content for a live session.
 */
export function generateICS(session: {
  title: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  roomId?: string;
  meetingLink?: string;
}) {
  const start = new Date(session.startTime);
  const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${session.roomId || session.meetingLink}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SARTHI//LearningOS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:${session.roomId || Math.random().toString(36).substring(2)}@sarthi-woad.vercel.app`,
    `SUMMARY:${session.title}`,
    `DESCRIPTION:${(session.description || '') + '\\n\\nJoin Link: ' + url}`,
    `LOCATION:${url}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

/**
 * Triggers a download of an ICS file.
 */
export function downloadICS(session: any) {
  const content = generateICS(session);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a data URL for an ICS file (useful for server-side response)
 */
export function createCalendarEvent(event: {
  title: string;
  description: string;
  startTime: Date | string;
  duration: number;
  location: string;
}) {
  const content = generateICS({
    title: event.title,
    description: event.description,
    startTime: event.startTime.toString(),
    durationMinutes: event.duration,
    meetingLink: event.location
  });
  
  return `data:text/calendar;charset=utf-8;base64,${Buffer.from(content).toString('base64')}`;
}
