export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { youtubeService } from '@/lib/youtube-api';

/**
 * POST /api/admin/seminars/[id]/go-live
 *
 * Marks a seminar as LIVE.
 * If the seminar has no youtubeVideoId yet, auto-creates a YouTube broadcast.
 * Returns the seminar with broadcastId so admin can distribute the stream key.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TEACHER'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const seminar = await prisma.seminar.findUnique({
            where: { id: params.id },
            include: { instructor: { select: { id: true, name: true } } },
        });

        if (!seminar) {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }

        // Only admin/instructor of this seminar can go live
        if (user.role === 'TEACHER' && seminar.instructorId !== user.id) {
            return NextResponse.json({ error: 'You are not the instructor of this seminar' }, { status: 403 });
        }

        if (seminar.status === 'LIVE') {
            return NextResponse.json({ message: 'Seminar is already live', seminar });
        }

        let broadcastId = seminar.youtubeBroadcastId;
        let streamId = seminar.youtubeStreamId;

        // Auto-create broadcast if none exists and streaming platform is YouTube
        if (!broadcastId && (seminar.streamingPlatform === 'YOUTUBE' || !seminar.streamingPlatform)) {
            try {
                const instructorId = seminar.instructorId || user.id;
                const broadcast = await youtubeService.createBroadcast(
                    instructorId,
                    seminar.title,
                    seminar.description || '',
                    seminar.scheduledAt || new Date()
                );

                broadcastId = broadcast.broadcastId;
                streamId = broadcast.streamId;

                // Save exact broadcast ID to seminar
                await prisma.seminar.update({
                    where: { id: params.id },
                    data: {
                        youtubeBroadcastId: broadcastId,
                        youtubeStreamId: streamId,
                        youtubeSetupStatus: 'READY'
                    },
                });
            } catch (ytError: any) {
                console.warn('[GoLive] Could not create YouTube broadcast:', ytError.message);
                // Status remains PENDING/FAILED. We don't fail the whole route so Google Meet fallbacks can still work.
                await prisma.seminar.update({
                    where: { id: params.id },
                    data: { youtubeSetupStatus: 'FAILED' }
                });
            }
        }

        // Update seminar status to LIVE
        const updatedSeminar = await prisma.seminar.update({
            where: { id: params.id },
            data: {
                status: 'LIVE',
                startedAt: new Date(),
                youtubeBroadcastId: broadcastId || undefined,
            },
        });

        // Audit Logging
        try {
            const { logYouTubeAudit } = await import('@/lib/youtube-audit');
            if (broadcastId) {
                await logYouTubeAudit({
                    teacherId: user.id,
                    action: 'GO_LIVE_STARTED',
                    status: 'SUCCESS',
                    courseId: seminar.courseId || undefined,
                    metadata: { seminarId: seminar.id, broadcastId }
                });
            }
        } catch (e) {
            console.warn('[GoLive] Audit log failed', e);
        }

        // Log platform activity
        await prisma.platformActivity.create({
            data: {
                type: 'SEMINAR_STARTED',
                userId: user.id,
                data: JSON.stringify({
                    seminarId: params.id,
                    title: seminar.title,
                    youtubeBroadcastId: broadcastId,
                    instructorName: seminar.instructor?.name || user.name,
                }),
            },
        }).catch(() => { });

        return NextResponse.json({
            success: true,
            seminar: updatedSeminar,
            youtubeBroadcastId: broadcastId,
            watchUrl: broadcastId ? `https://youtu.be/${broadcastId}` : null,
        });
    } catch (error: any) {
        console.error('[GoLive] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to go live' }, { status: 500 });
    }
}
