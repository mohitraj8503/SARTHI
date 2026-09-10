import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { livekit } from '@/lib/livekit';
import { TrackSource } from 'livekit-server-sdk';

/**
 * POST /api/live-class/admin/mute-participant
 *
 * Host-only: server-side mute of a participant's microphone track.
 * Uses RoomServiceClient to find and mute the actual track — not just
 * a data-channel request the student could ignore.
 *
 * Body: { liveClassId, targetIdentity }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { liveClassId, targetIdentity } = await req.json();
    if (!liveClassId || !targetIdentity) {
      return NextResponse.json({ error: 'liveClassId and targetIdentity required' }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: { teacherId: true, roomName: true },
    });
    if (!liveClass?.roomName) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roomService = livekit.getRoomServiceClient();

    // Get participant's track list from LiveKit
    const participant = await roomService.getParticipant(liveClass.roomName, targetIdentity);
    const micTracks = participant.tracks.filter((t) => t.source === TrackSource.MICROPHONE);

    if (micTracks.length === 0) {
      // Participant has no active mic track — already effectively muted
      return NextResponse.json({ success: true, message: 'Already muted or no mic track found' });
    }

    // Mute each mic track server-side
    await Promise.all(
      micTracks.map((track) =>
        roomService.mutePublishedTrack(liveClass.roomName!, targetIdentity, track.sid, true)
      )
    );

    return NextResponse.json({ success: true, muteCount: micTracks.length });
  } catch (error: any) {
    console.error('[admin/mute-participant]', error);
    return NextResponse.json({ error: 'Failed to mute participant', details: error?.message }, { status: 500 });
  }
}
