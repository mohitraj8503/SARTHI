/**
 * SARTHI Class Name Formatter
 * Converts raw room IDs into clean, readable class identifiers
 * Used across: classroom UI, recordings, Google Drive filenames, analytics
 */

interface ClassMeta {
  subject?: string;
  teacherName?: string;
  courseTitle?: string;
}

/**
 * Formats a raw room ID into a clean, branded class name
 * @example formatClassName('class-1777183055338-snr5') → 'Live Class | 11:28 AM'
 * @example formatClassName('class-1777183055338-snr5', { subject: 'Physics', teacherName: 'Mohit Raj' }) → 'Physics | Mr. Mohit | 11:28 AM'
 */
export function formatClassName(roomName: string, meta?: ClassMeta): string {
  // Extract timestamp from room name pattern: class-{timestamp}-{random}
  const timestampMatch = roomName.match(/class-(\d+)-/);
  let timeStr = '';

  if (timestampMatch) {
    const ts = parseInt(timestampMatch[1], 10);
    const date = new Date(ts);
    if (!isNaN(date.getTime())) {
      timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  if (!timeStr) {
    timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Build formatted name based on available metadata
  const parts: string[] = [];

  if (meta?.subject || meta?.courseTitle) {
    parts.push((meta.subject || meta.courseTitle || '').slice(0, 15));
  } else {
    parts.push('Live Class');
  }

  if (meta?.teacherName) {
    const shortName = meta.teacherName.split(' ')[0];
    parts.push(`Mr. ${shortName}`);
  }

  parts.push(timeStr);

  return parts.join(' | ');
}

/**
 * Formats a room name into a Google Drive-safe filename
 * @example formatRecordingName('class-1777183055338-snr5', { subject: 'Physics' }) → 'TT_Physics_26-Apr-2025_1128AM.mp4'
 */
export function formatRecordingName(roomName: string, meta?: ClassMeta): string {
  const timestampMatch = roomName.match(/class-(\d+)-/);
  let dateStr = '';
  let timeStr = '';

  if (timestampMatch) {
    const ts = parseInt(timestampMatch[1], 10);
    const date = new Date(ts);
    if (!isNaN(date.getTime())) {
      dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/[:\s]/g, '');
    }
  }

  if (!dateStr) dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  if (!timeStr) timeStr = '';

  const subject = (meta?.subject || meta?.courseTitle || 'LiveClass').replace(/\s+/g, '_').slice(0, 20);
  return `TT_${subject}_${dateStr}_${timeStr}.mp4`;
}

/**
 * Generates a short session code for display
 * @example getSessionCode('class-1777183055338-snr5') → 'SNR5'
 */
export function getSessionCode(roomName: string): string {
  const parts = roomName.split('-');
  const code = parts[parts.length - 1] || 'LIVE';
  return code.toUpperCase().slice(0, 4);
}
