export interface QuickLiveSession {
  id: string;
  lessonId?: string | null;
  roomId?: string | null;
  meetingLink?: string | null;
  status?: string;
  startTime?: string;
}

function toDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function startQuickLive(): Promise<{ roomId: string }> {
  const sessionsRes = await fetch('/api/teacher/sessions', { cache: 'no-store' });
  const sessions: QuickLiveSession[] = sessionsRes.ok ? await sessionsRes.json() : [];

  const liveSession = sessions.find((s) => s.status === 'live');
  if (liveSession) {
    const liveRoomId = liveSession.roomId || liveSession.meetingLink;
    if (liveRoomId) {
      return { roomId: liveRoomId };
    }
  }

  const now = new Date();
  const scheduledSession = sessions
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => {
      const ta = toDate(a.startTime)?.getTime() || Number.MAX_SAFE_INTEGER;
      const tb = toDate(b.startTime)?.getTime() || Number.MAX_SAFE_INTEGER;
      return ta - tb;
    })
    .find((s) => {
      const start = toDate(s.startTime);
      if (!start) return false;
      const diffMin = (start.getTime() - now.getTime()) / (1000 * 60);
      return diffMin <= 60;
    });

  if (scheduledSession?.id) {
    await Promise.all([
      fetch(`/api/teacher/sessions/${scheduledSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'live' }),
      }),
      fetch('/api/livekit/session/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: scheduledSession.roomId || scheduledSession.meetingLink,
          status: 'live',
          lessonId: scheduledSession.lessonId || undefined,
        }),
      }),
    ]);

    const scheduledRoomId = scheduledSession.roomId || scheduledSession.meetingLink;
    if (scheduledRoomId) {
      return { roomId: scheduledRoomId };
    }
  }

  const nowIso = new Date().toISOString();
  const createRes = await fetch('/api/teacher/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Quick Live Session',
      description: 'Instant live class from teacher dashboard.',
      startTime: nowIso,
      durationMinutes: 90,
      privacy: 'enrolled',
    }),
  });

  const createPayload = await createRes.json();
  if (!createRes.ok || !createPayload?.session?.id) {
    throw new Error(createPayload?.error || 'Unable to create quick live session');
  }

  const session = createPayload.session;
  await Promise.all([
    fetch(`/api/teacher/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'live' }),
    }),
    fetch('/api/livekit/session/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: session.roomId || session.meetingLink,
        status: 'live',
        lessonId: session.lessonId || undefined,
      }),
    }),
  ]);

  const createdRoomId = session.roomId || session.meetingLink;
  if (!createdRoomId) {
    throw new Error('Quick live room not available');
  }

  return { roomId: createdRoomId };
}
