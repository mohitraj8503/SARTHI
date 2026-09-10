export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { youtubeService } from '@/lib/youtube-api';

/**
 * POST /api/admin/seminars/[id]/end-live
 *
 * Ends a live seminar and handles the complete post-live pipeline:
 * 1. Updates seminar status → ENDED
 * 2. Transitions YouTube broadcast → complete
 * 3. If seminar has a linked courseId:
 *    a. Gets the course's youtubePlaylistId
 *    b. Adds the recording to the course playlist
 *    c. Creates a new Lesson in DB linked to this course
 * 4. Saves recordingUrl on the seminar
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
            include: {
                course: { select: { id: true, title: true, youtubePlaylistId: true } },
            },
        });

        if (!seminar) {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }

        // Only admin/instructor can end stream
        if (user.role === 'TEACHER' && seminar.instructorId !== user.id) {
            return NextResponse.json({ error: 'You are not the instructor of this seminar' }, { status: 403 });
        }

        if (seminar.status === 'ENDED' || seminar.status === 'COMPLETED') {
            return NextResponse.json({ message: 'Seminar already ended', seminar });
        }

        const instructorId = seminar.instructorId || user.id;
        const broadcastId = seminar.youtubeBroadcastId;
        const endedAt = new Date();

        // 1. Transition YouTube broadcast to complete (non-blocking part)
        if (broadcastId) {
            try {
                await youtubeService.transitionBroadcast(instructorId, broadcastId, 'complete');
                console.log(`[EndLive] Broadcast ${broadcastId} transitioned to complete`);
            } catch (ytErr: any) {
                console.warn('[EndLive] Broadcast transition warning:', ytErr.message);
            }
        }

        // 2. Mark seminar as ENDED and set state to PENDING_ARCHIVE
        // We do NOT instantly inject into a playlist or create a lesson here. Race condition risk.
        const updatedSeminar = await prisma.seminar.update({
            where: { id: params.id },
            data: {
                status: 'ENDED',
                endedAt,
            },
        });

        // 3. Log Audit Activity
        const playlistAdded = false;
        const lessonCreated = null;

        try {
            const { logYouTubeAudit } = await import('@/lib/youtube-audit');
            await logYouTubeAudit({
                teacherId: user.id,
                action: 'LIVE_ENDED',
                status: 'SUCCESS',
                courseId: seminar.courseId || undefined,
                metadata: { seminarId: seminar.id, youtubeBroadcastId: broadcastId },
            });
        } catch (e) {
            console.warn('[EndLive] Audit logging failed', e);
        }

        // 4. Log platform activity
        await prisma.platformActivity.create({
            data: {
                type: 'SEMINAR_ENDED',
                userId: user.id,
                data: JSON.stringify({
                    seminarId: params.id,
                    title: seminar.title,
                    youtubeBroadcastId: broadcastId,
                    action: 'PENDING_ARCHIVE_SYNC_DETERMINED'
                }),
            },
        }).catch(() => { });

        // IMPORTANT: In the new architecture, we optionally hit the check-archive endpoint 
        // to attempt an immediate sync if ready, rather than blocking the user.
        // Usually, a background cron job handles this.
        if (broadcastId && seminar.courseId) {
            try {
                // Fire and forget asynchronous sync trigger
                fetch(`${req.nextUrl.origin}/api/admin/youtube/check-archive/${seminar.id}`, {
                    method: 'POST',
                    headers: { 'Cookie': req.headers.get('cookie') || '' }
                }).catch(() => { });
            } catch (e) { }
        }

        return NextResponse.json({
            success: true,
            seminar: updatedSeminar,
            playlistAdded: false,
            lessonCreated: null,
            message: "Stream ended. Replay is pending YouTube archive processing."
        });
    } catch (error: any) {
        console.error('[EndLive] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to end live' }, { status: 500 });
    }
}
