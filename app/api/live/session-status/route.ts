import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { findSessionByAnyId } from '@/lib/session-utils';

export async function GET(request: Request) {
  try {
    const auth = await getSession();
    if (!auth?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const sessionId = searchParams.get('sessionId');
    const identifier = lessonId || sessionId;

    if (!identifier) {
      return NextResponse.json({ error: 'lessonId or sessionId is required' }, { status: 400 });
    }

    const sessionMatch = await findSessionByAnyId(identifier);
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const raw = sessionMatch.data as any;
    const liveStatusRaw = sessionMatch.type === 'lesson'
      ? raw.liveStatus
      : raw.status === 'live' ? 'LIVE' : raw.status === 'completed' ? 'ENDED' : 'SCHEDULED';

    let status: 'not_started' | 'live' | 'ended' = 'not_started';
    if (String(liveStatusRaw).toUpperCase() === 'LIVE') status = 'live';
    if (String(liveStatusRaw).toUpperCase() === 'ENDED' || String(liveStatusRaw).toLowerCase() === 'completed') status = 'ended';

    const cta = status === 'live'
      ? { label: '🔴 Live Now - Enter', variant: 'live', disabled: false }
      : status === 'ended'
        ? { label: '📺 Watch Recording', variant: 'recording', disabled: false }
        : { label: '⏰ Starts Soon', variant: 'scheduled', disabled: true };

    return NextResponse.json({
      success: true,
      data: {
        status,
        lessonId: sessionMatch.type === 'lesson' ? raw.id : raw.lessonId,
        sessionId: sessionMatch.type === 'liveSession' ? raw.id : `lesson_${raw.id}`,
        roomName: sessionMatch.liveRoomName,
        cta,
      },
    });
  } catch (error) {
    console.error('[LIVE_SESSION_STATUS]', error);
    return NextResponse.json({ error: 'Failed to fetch session status' }, { status: 500 });
  }
}
