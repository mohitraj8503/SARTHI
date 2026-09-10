import { EgressClient, EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/live/recording
 * Action: "start" | "stop"
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'TEACHER' && session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, action } = await req.json();
    if (!lessonId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const host = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !host) {
      return NextResponse.json({ error: 'LiveKit not configured' }, { status: 500 });
    }

    const egressClient = new EgressClient(host, apiKey, apiSecret);

    if (action === 'start') {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: true }
      });

      const roomName = `course_${lesson?.module?.courseId}_lesson_${lessonId}`;
      const filepath = `recordings/${roomName}.mp4`;

      const output = new EncodedFileOutput({
        fileType: EncodedFileType.MP4,
        filepath: filepath,
        // In production, configure S3/Google Cloud Storage here
        // s3: { bucket: "sarthi-recordings", ... }
      });

      const egressInfo = await egressClient.startRoomCompositeEgress(
        roomName,
        {
          file: output,
          layout: 'speaker'
        }
      );

      // Save egressId and status
      await prisma.$transaction([
        prisma.lesson.update({
          where: { id: lessonId },
          data: { 
            egressId: egressInfo.egressId,
            isRecording: true
          }
        }),
        prisma.liveSession.updateMany({
          where: { lessonId: lessonId },
          data: {
            egressId: egressInfo.egressId,
            isRecording: true,
            recordingStartedAt: new Date(),
            status: 'live'
          }
        })
      ]);

      return NextResponse.json({ success: true, egressId: egressInfo.egressId });
    } 
    
    if (action === 'stop') {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { egressId: true }
      });

      if (!lesson?.egressId) {
        return NextResponse.json({ error: 'No active recording found' }, { status: 404 });
      }

      try {
        await egressClient.stopEgress(lesson.egressId);
      } catch (err) {
        console.error('Failed to stop egress (might already be stopped):', err);
      }

      await prisma.$transaction([
        prisma.lesson.update({
          where: { id: lessonId },
          data: { 
            egressId: null,
            isRecording: false
          }
        }),
        prisma.liveSession.updateMany({
          where: { lessonId: lessonId },
          data: {
            egressId: null,
            isRecording: false,
            recordingEndedAt: new Date()
          }
        })
      ]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API/Live/Recording] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
