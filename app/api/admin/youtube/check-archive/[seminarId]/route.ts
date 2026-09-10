export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { YouTubeService } from '@/lib/youtube-api';
import { assertTeacherCanPublishToCoursePlaylist } from '@/lib/youtube-auth';
import { logYouTubeAudit } from '@/lib/youtube-audit';

/**
 * ARCHIVE SYNC & RETRY JOB
 *
 * This API endpoint safely resolves a terminated YouTube stream's archive.
 * It ensures the video metadata natively exists before securely linking it
 * to a course playlist and creating the actual Lesson.
 */
export async function POST(request: NextRequest, props: { params: Promise<{ seminarId: string }> }) {
    const params = await props.params;
    try {
        const authSession = await getCurrentUser() as any;
        if (!authSession || !authSession.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authSession.id },
            select: { id: true, role: true, youtubeAccessToken: true, youtubeChannelId: true }
        });

        const role = String(user?.role || '').toUpperCase();
        const canAccess = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR'].includes(role);

        if (!user || !canAccess || !user.youtubeAccessToken) {
            return NextResponse.json({ error: 'Unauthorized or missing YouTube connection' }, { status: 401 });
        }

        const { seminarId } = params;

        const seminar = await prisma.seminar.findUnique({
            where: { id: seminarId },
            include: { course: true },
        });

        if (!seminar) {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }

        // Teachers/instructors can only process their own seminars.
        if (['TEACHER', 'INSTRUCTOR'].includes(role) && seminar.instructorId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (seminar.youtubeSyncStatus === 'PLAYLIST_ADDED') {
            return NextResponse.json({ message: 'Archive already processed and linked' }, { status: 200 });
        }

        if (seminar.status !== 'ENDED' || !seminar.youtubeBroadcastId) {
            return NextResponse.json(
                { error: 'Seminar is either not ended or lacks a Broadcast ID' },
                { status: 400 }
            );
        }

        const youtubeService = new YouTubeService();

        // Step 1: Resolve the actual finalized Video ID from the completed broadcast
        let resolvedVideoId = seminar.recordingVideoId;

        if (!resolvedVideoId) {
            try {
                const broadcastDetails = await youtubeService.getBroadcastDetails(user.id, seminar.youtubeBroadcastId);
                if (broadcastDetails?.boundStreamId && broadcastDetails?.recordingStatus === 'recording') {
                    // Note: In pure API terms, broadcast ID often mirrors video ID, but let's be explicit
                    resolvedVideoId = seminar.youtubeBroadcastId;
                } else if (broadcastDetails?.id) {
                    resolvedVideoId = broadcastDetails.id;
                }
            } catch (err) {
                console.warn('Could not cleanly resolve broadcast details for archive check:', err);
            }
        }

        if (!resolvedVideoId) {
            return NextResponse.json({
                status: 'PENDING_ARCHIVE',
                message: 'Archive URL is not yet natively resolvable.'
            }, { status: 202 });
        }

        // Step 2: Ensure the video metadata is actually ready and processed
        try {
            const videoDetails = await youtubeService.getVideoDetails(user.id, resolvedVideoId);
            if (!videoDetails) {
                return NextResponse.json({
                    status: 'PENDING_ARCHIVE',
                    message: 'Video metadata is not yet ready on YouTube.'
                }, { status: 202 });
            }
        } catch (err) {
            return NextResponse.json({
                status: 'PENDING_ARCHIVE',
                message: 'Video metadata fetch failed (likely still processing).'
            }, { status: 202 });
        }

        // Attempt Playlist insertion safely
        let playlistItemId: string | null = null;
        let playlistIdToUse: string | null = null;

        if (seminar.courseId && user.youtubeChannelId) {
            try {
                // STRICT AUTH GUARD
                const mapping = await assertTeacherCanPublishToCoursePlaylist({
                    teacherId: user.id,
                    courseId: seminar.courseId,
                    oauthChannelId: user.youtubeChannelId
                });

                playlistIdToUse = mapping.playlistId;

                const existingPlaylistEntry = await youtubeService.isVideoAlreadyInPlaylist(
                    user.id,
                    playlistIdToUse,
                    resolvedVideoId
                );

                if (existingPlaylistEntry.exists) {
                    playlistItemId = existingPlaylistEntry.itemId || null;
                } else {
                    const playlistRes = await youtubeService.addVideoToPlaylist(user.id, playlistIdToUse, resolvedVideoId);
                    playlistItemId = playlistRes?.id || null;
                }

            } catch (authErr: any) {
                console.error('Playlist strict auth failed during archive check:', authErr);
                await logYouTubeAudit({
                    teacherId: user.id,
                    action: 'PLAYLIST_INSERT_FAILED',
                    status: 'FAILED',
                    courseId: seminar.courseId,
                    videoId: resolvedVideoId,
                    metadata: { error: authErr.message }
                });
                // We do not strict-fail the whole process if playlist insertion fails, 
                // the video is still ready as an unlinked lesson.
            }
        }

        // Database Update
        // Execute atomically
        await prisma.$transaction(async (tx) => {
            // Update Seminar
            await tx.seminar.update({
                where: { id: seminar.id },
                data: {
                    recordingVideoId: resolvedVideoId,
                    youtubeSyncStatus: playlistItemId ? 'PLAYLIST_ADDED' : 'ARCHIVE_DETECTED',
                }
            });

            if (!seminar.courseId) {
                return;
            }

            const existingReplayLesson = await tx.lesson.findFirst({
                where: {
                    courseId: seminar.courseId,
                    OR: [
                        { originSeminarId: seminar.id },
                        { youtube_video_id: resolvedVideoId },
                    ],
                },
                select: { id: true },
            });

            if (existingReplayLesson) {
                return;
            }

            // Create Lesson safely
            const orderNumber = (await tx.lesson.count({ where: { courseId: seminar.courseId } })) + 1;

            await tx.lesson.create({
                data: {
                    title: `${seminar.title} (Live Replay)`,
                    description: seminar.description || 'Recorded live session.',
                    courseId: seminar.courseId,
                    orderNumber,
                    sourceType: 'LIVE_REPLAY',
                    youtube_video_id: resolvedVideoId,
                    originSeminarId: seminar.id,
                    originBroadcastId: seminar.youtubeBroadcastId,
                    youtubePlaylistItemId: playlistItemId,
                    upload_status: 'COMPLETE',
                    isPublished: true,
                }
            });
        });

        await logYouTubeAudit({
            teacherId: user.id,
            action: 'ARCHIVE_LINKED',
            status: 'SUCCESS',
            courseId: seminar.courseId || undefined,
            playlistId: playlistIdToUse || undefined,
            videoId: resolvedVideoId,
            metadata: { playlistItemId }
        });

        return NextResponse.json({
            status: playlistItemId ? 'PLAYLIST_ADDED' : 'ARCHIVE_DETECTED',
            videoId: resolvedVideoId
        }, { status: 200 });

    } catch (error) {
        console.error('Error checking YouTube archive:', error);
        return NextResponse.json({ error: 'Failed to process archive' }, { status: 500 });
    }
}
