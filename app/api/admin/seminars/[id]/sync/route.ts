export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { youtubeService } from '@/lib/youtube-api';
import { logAdminActivity, ActivityType } from '@/lib/admin-logging';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const seminar = await prisma.seminar.findUnique({
            where: { id: params.id },
            include: { instructor: true }
        });

        if (!seminar || !seminar.youtubeBroadcastId) {
            return NextResponse.json({ error: "Seminar or YouTube Broadcast ID not found" }, { status: 404 });
        }

        // 1. Fetch current details from YouTube
        // Try with seminar's instructor first, fallback to Admin (system)
        let broadcastData;
        let userIdToUse = seminar.instructorId;
        
        try {
            broadcastData = await youtubeService.getVideoDetails(seminar.instructorId ?? '', seminar.youtubeBroadcastId);
        } catch (e) {
            // Fallback to searching for an admin with YouTube access
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN', youtubeAccessToken: { not: null } }
            });
            if (!admin) throw new Error("No authenticated YouTube client found to sync");
            userIdToUse = admin.id;
            broadcastData = await youtubeService.getVideoDetails(admin.id, seminar.youtubeBroadcastId);
        }

        const ytVideo = broadcastData.items?.[0];
        if (!ytVideo) {
            return NextResponse.json({ error: "Video not found on YouTube" }, { status: 404 });
        }

        const ytStatus = ytVideo.liveStreamingDetails?.actualEndTime ? 'complete' : 
                         ytVideo.liveStreamingDetails?.actualStartTime ? 'live' : 'upcoming';
        const ytTitle = ytVideo.snippet.title;
        
        // 2. Update local seminar record
        const updatedSeminar = await prisma.seminar.update({
            where: { id: params.id },
            data: {
                title: ytTitle,
                // Map YouTube status to our internal status if needed
                status: ytStatus === 'complete' ? 'ENDED' : 
                        ytStatus === 'live' ? 'LIVE' : 
                        ytStatus === 'upcoming' ? 'SCHEDULED' : seminar.status
            }
        });

        // 3. Log Activity
        await logAdminActivity({
            userId: user.id,
            actorName: user.name || "Admin",
            type: ActivityType.COURSE_UPDATED, // Reusing for general update
            targetId: seminar.id,
            targetName: seminar.title,
            description: `Synced YouTube metadata for seminar: ${seminar.title}`,
            metadata: {
                youtubeStatus: ytStatus,
                previousStatus: seminar.status,
                newStatus: updatedSeminar.status
            }
        });

        return NextResponse.json({ 
            success: true, 
            seminar: updatedSeminar,
            youtubeStatus: ytStatus 
        });

    } catch (error: any) {
        console.error("[Seminar Sync API] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
