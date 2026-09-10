import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seminarId = searchParams.get('seminarId');
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  if (!seminarId) {
    return NextResponse.json({ error: "Missing seminarId" }, { status: 400 });
  }

  try {
    const registration = await prisma.seminarRegistration.findUnique({
      where: { seminarId_userId: { seminarId, userId: user.id } },
    });

    if (!registration || registration.paymentStatus !== 'completed') {
      return NextResponse.json({ error: "Not registered or payment incomplete" }, { status: 403 });
    }

    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    const replay = {
      canAccess: seminar.status === 'ENDED' || seminar.status === 'LIVE',
      hasRecording: !!seminar.recordingVideoId || !!seminar.youtubeBroadcastId,
      videoId: seminar.recordingVideoId || seminar.youtubeBroadcastId,
      embedUrl: seminar.youtubeStreamUrl || (seminar.recordingVideoId ? `https://www.youtube.com/embed/${seminar.recordingVideoId}` : null),
      endedAt: seminar.endedAt,
    };

    return NextResponse.json(replay);
  } catch (error) {
    console.error("Replay access error:", error);
    return NextResponse.json({ error: "Failed to check access" }, { status: 500 });
  }
}

