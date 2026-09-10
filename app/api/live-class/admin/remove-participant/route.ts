import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { livekit } from '@/lib/livekit';

/**
 * POST /api/live-class/admin/remove-participant
 *
 * Host-only: server-side kick of a participant from the LiveKit room.
 * Uses RoomServiceClient.removeParticipant() — this actually terminates
 * the participant's WebRTC session, making it impossible to bypass client-side.
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

    // Cannot remove the teacher themselves — that's "End class"
    if (targetIdentity === session.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself — use End Class instead' }, { status: 400 });
    }

    const roomService = livekit.getRoomServiceClient();

    // This actually disconnects the participant's WebRTC connection server-side
    await roomService.removeParticipant(liveClass.roomName, targetIdentity);

    return NextResponse.json({ success: true, removed: targetIdentity });
  } catch (error: any) {
    // LK throws if participant not found in room — treat as already removed
    if (error?.message?.includes('not found') || error?.code === 404) {
      return NextResponse.json({ success: true, message: 'Participant already left' });
    }
    console.error('[admin/remove-participant]', error);
    return NextResponse.json({ error: 'Failed to remove participant', details: error?.message }, { status: 500 });
  }
}
