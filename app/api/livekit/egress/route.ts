import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { livekit } from '@/lib/livekit';
import { findSessionByAnyId } from '@/lib/session-utils';
import { recordingQueue } from '@/lib/recording/recording-manager';

/**
 * POST /api/livekit/egress
 * Starts or stops cloud recording for a SARTHI Meet room.
 * Only teachers with roomAdmin grants can trigger this.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Only teachers can control recording' }, { status: 403 });
    }

    const { roomName, action } = await req.json();

    if (!roomName || !action) {
      return NextResponse.json({ error: 'roomName and action are required' }, { status: 400 });
    }

    if (action === 'start') {
      // 1. Precise Lookup & Atomic Lock
      const sessionMatch = await findSessionByAnyId(roomName);
      if (!sessionMatch) {
        return NextResponse.json({ error: 'Session context not found' }, { status: 404 });
      }

      const liveSessionId = (sessionMatch.type === 'liveSession') 
        ? (sessionMatch.data as any).id 
        : (await prisma.liveSession.findUnique({ where: { roomId: roomName } }))?.id;

      if (!liveSessionId) {
        return NextResponse.json({ error: 'Live session record not established' }, { status: 400 });
      }

      // Check if already recording to prevent duplicates
      const currentSession = await prisma.liveSession.findUnique({
        where: { id: liveSessionId },
        select: { isRecording: true }
      });

      if (currentSession?.isRecording) {
        return NextResponse.json({ error: 'Recording already in progress', message: 'This room is already being recorded.' }, { status: 409 });
      }

      // 2. Add to Background Queue
      await recordingQueue.addTask(roomName, liveSessionId);
      console.log(`🔴 Recording queued: ${roomName}`);

      return NextResponse.json({ success: true, status: 'QUEUED', message: 'Recording is starting in the background.' });
    }

    if (action === 'stop') {
      const egressClient = livekit.getEgressClient();
      
      // List active egresses for this room and stop them
      const egresses = await egressClient.listEgress({ roomName });
      let stoppedCount = 0;
      for (const egress of egresses) {
        if (egress.status === 0 || egress.status === 1) { // EGRESS_STARTING or EGRESS_ACTIVE
          await egressClient.stopEgress(egress.egressId);
          stoppedCount++;
        }
      }
      console.log(`⏹️ Stopped ${stoppedCount} recording(s) for room ${roomName}`);
      return NextResponse.json({ success: true, stoppedCount });
    }

    return NextResponse.json({ error: 'Invalid action. Use "start" or "stop".' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ LiveKit Egress Error:', error);
    return NextResponse.json({
      error: 'Recording operation failed',
      message: error?.message
    }, { status: 500 });
  }
}

