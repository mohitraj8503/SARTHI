import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';
import { createPrivateBroadcast } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

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

    // 1. Create Broadcast on YouTube
    const broadcastInfo = await createPrivateBroadcast(
      liveClass.title,
      liveClass.description || `Live Class for course ${liveClass.courseId}`,
      new Date().toISOString()
    );

    const rtmpUrl = `${broadcastInfo.ingestionAddress}/${broadcastInfo.streamKey}`;

    // 2. Call local Relay service /api/start
    const relayHost = process.env.RELAY_API_URL || 'http://localhost:5001';
    const relaySecret = process.env.RELAY_API_SECRET || 'fallback_secret_change_in_production';
    
    try {
      const relayRes = await fetch(`${relayHost}/api/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-relay-secret': relaySecret
        },
        body: JSON.stringify({
          liveClassId: id,
          rtmpUrl
        })
      });

      if (!relayRes.ok) {
        const errText = await relayRes.text();
        throw new Error(`Relay service returned status ${relayRes.status}: ${errText}`);
      }
    } catch (relayErr: any) {
      console.error('Failed to notify relay service:', relayErr);
      return ApiResponse.error(`Relay Ingestion failed: ${relayErr.message}`, 'RELAY_ERROR', 500);
    }

    // 3. Update DB
    const updatedClass = await prisma.liveClass.update({
      where: { id },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
        youtubeBroadcastId: broadcastInfo.broadcastId,
        youtubeStreamId: broadcastInfo.streamId,
        youtubeVideoId: broadcastInfo.broadcastId
      }
    });

    const relayWsUrl = process.env.NEXT_PUBLIC_RELAY_WS_URL || 'ws://localhost:5001';

    return ApiResponse.success({
      liveClass: updatedClass,
      streamKey: broadcastInfo.streamKey,
      ingestionAddress: broadcastInfo.ingestionAddress,
      wsUrl: `${relayWsUrl}/live/${id}`
    }, 'Live Class started successfully.');
  } catch (error: any) {
    console.error('Error starting live class:', error);
    return handleApiError(error);
  }
}
