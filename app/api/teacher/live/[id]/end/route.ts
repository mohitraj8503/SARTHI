import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';
import { endYouTubeBroadcast, getVideoDetails } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

// Helper to poll and process recording asynchronously
async function pollAndProcessRecording(liveClassId: string, youtubeVideoId: string, courseId: string) {
  let attempts = 0;
  const maxAttempts = 30; // 30 mins (checking every 1 min)
  
  while (attempts < maxAttempts) {
    try {
      console.log(`[YouTube poll] Checking status for video: ${youtubeVideoId}, attempt: ${attempts + 1}`);
      const details = await getVideoDetails(youtubeVideoId);
      
      const processingStatus = details?.processingDetails?.processingStatus || 'succeeded'; // Fallback if no details or mock
      
      if (processingStatus === 'succeeded') {
        const durationSeconds = details?.contentDetails?.duration 
          ? parseISO8601Duration(details.contentDetails.duration) 
          : 0;

        console.log(`[YouTube poll] Video ${youtubeVideoId} processed successfully! Creating Recording record.`);
        
        await prisma.liveClassRecording.upsert({
          where: { liveClassId },
          create: {
            liveClassId,
            courseId,
            youtubeVideoId,
            durationSeconds,
            processedAt: new Date()
          },
          update: {
            youtubeVideoId,
            durationSeconds,
            processedAt: new Date()
          }
        });
        break;
      }
    } catch (err) {
      console.error(`Error polling YouTube status for ${youtubeVideoId}:`, err);
    }
    
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 60000)); // wait 1 minute
  }
}

// ISO 8601 Duration Parser (e.g. PT1H2M10S -> seconds)
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return (hours * 3600) + (minutes * 60) + seconds;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateTeacher(request);
    const { id } = await params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: userId }
    });

    if (!liveClass) {
      return ApiResponse.error('Live class not found or unauthorized', 'NOT_FOUND', 404);
    }

    // 1. Transition YouTube Broadcast to completed
    if (liveClass.youtubeBroadcastId) {
      try {
        await endYouTubeBroadcast(liveClass.youtubeBroadcastId);
      } catch (ytErr) {
        console.error('Failed to end YouTube broadcast:', ytErr);
        // Continue to end session locally even if YT API fails
      }
    }

    // 2. Call Relay server /api/stop
    const relayHost = process.env.RELAY_API_URL || 'http://localhost:5001';
    const relaySecret = process.env.RELAY_API_SECRET || 'fallback_secret_change_in_production';
    try {
      await fetch(`${relayHost}/api/stop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-relay-secret': relaySecret
        },
        body: JSON.stringify({ liveClassId: id })
      });
    } catch (relayErr) {
      console.error('Failed to stop relay session:', relayErr);
    }

    // 3. Update DB
    const updatedClass = await prisma.liveClass.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    // 4. Trigger asynchronous polling for YouTube recording details
    if (liveClass.youtubeVideoId) {
      pollAndProcessRecording(id, liveClass.youtubeVideoId, liveClass.courseId).catch((err) => {
        console.error('Background polling error for live class recording:', err);
      });
    }

    return ApiResponse.success(updatedClass, 'Live Class ended successfully.');
  } catch (error: any) {
    return handleApiError(error);
  }
}
