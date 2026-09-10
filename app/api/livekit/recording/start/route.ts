import { NextResponse } from 'next/server';
import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomName, sessionId, lessonId } = await req.json();
    if (!roomName || (!sessionId && !lessonId)) {
      return NextResponse.json({ error: 'Room name and session/lesson ID are required' }, { status: 400 });
    }

    const { livekit } = await import('@/lib/livekit');
    const egressClient = livekit.getEgressClient();

    // Recording configuration - S3 storage
    const output = new EncodedFileOutput({
      filepath: `recordings/${sessionId}/{time}.mp4`,
      output: {
        case: 's3',
        value: new S3Upload({
          accessKey: process.env.AWS_ACCESS_KEY!,
          secret: process.env.AWS_SECRET_KEY!,
          bucket: process.env.AWS_BUCKET_NAME!,
          region: process.env.AWS_REGION || 'ap-south-1',
        }),
      },
    });

    // Start Composite Egress
    const egressInfo = await egressClient.startRoomCompositeEgress(
      roomName,
      { file: output },
      {
        layout: 'speaker', // speaker-dark is a custom layout, using default speaker for stability
        audioOnly: false,
      }
    );

    // Save egress ID and update recording status
    if (sessionId) {
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: { 
          egressId: egressInfo.egressId,
          isRecording: true,
          recordingStartedAt: new Date(),
        }
      });
    }

    if (lessonId || sessionId) {
       // Also try to find lesson to update its status
       const lesson = await prisma.lesson.findFirst({
         where: { 
           OR: [
             { id: lessonId || 'none' },
             { liveRoomName: roomName }
           ]
         }
       });

       if (lesson) {
         await prisma.lesson.update({
           where: { id: lesson.id },
           data: { 
             egressId: egressInfo.egressId,
             isRecording: true 
           }
         });
       }
    }

    return NextResponse.json({ 
      success: true, 
      egressId: egressInfo.egressId 
    });

  } catch (error: any) {
    console.error('❌ Failed to start recording:', error);
    return NextResponse.json({ 
      error: 'Recording start failed', 
      message: error?.message 
    }, { status: 500 });
  }
}

