export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { YouTubeService } from '@/lib/youtube-api';

/**
 * POST /api/teacher/courses/[courseId]/add-video
 *
 * Teacher manually adds a YouTube video URL to their course.
 * - Validates teacher owns the course
 * - Adds the video to the course's YouTube playlist
 * - Creates a new published Lesson in DB
 */
export async function POST(req: NextRequest, props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    try {
        const authSession = await getCurrentUser() as any;
        if (!authSession || !authSession.id || !['TEACHER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(authSession.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authSession.id },
            select: { id: true, role: true, youtubeAccessToken: true, youtubeChannelId: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in DB' }, { status: 401 });
        }

        const { videoUrl, title: customTitle, description: customDescription } = await req.json();

        if (!videoUrl) {
            return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
        }

        // Extract YouTube video ID from URL
        let videoId = '';
        try {
            if (videoUrl.includes('youtube.com/watch?v=')) {
                videoId = new URL(videoUrl).searchParams.get('v') || '';
            } else if (videoUrl.includes('youtu.be/')) {
                videoId = new URL(videoUrl).pathname.slice(1);
            } else if (/^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
                videoId = videoUrl; // raw video ID
            }
        } catch {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        if (!videoId) {
            return NextResponse.json({ error: 'Could not extract YouTube video ID from URL' }, { status: 400 });
        }

        // Fetch course and verify ownership
        const course = await prisma.course.findUnique({
            where: { id: params.courseId },
            select: {
                id: true,
                title: true,
                instructorId: true,
                youtubePlaylistId: true,
            },
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Only course instructor or admin can add videos
        if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role) && course.instructorId !== user.id) {
            return NextResponse.json({ error: 'You do not own this course' }, { status: 403 });
        }

        // Check if lesson already exists for this video
        const existingLesson = await prisma.lesson.findFirst({
            where: { courseId: course.id, youtube_video_id: videoId },
        });
        if (existingLesson) {
            return NextResponse.json({
                message: 'Video already exists as a lesson',
                lesson: existingLesson,
            });
        }

        const youtubeService = new YouTubeService();
        const { assertTeacherCanPublishToCoursePlaylist } = await import('@/lib/youtube-auth');
        const { logYouTubeAudit } = await import('@/lib/youtube-audit');

        // Security Step 1: Strict Ownership Guard
        // Even if they are the course instructor, do they own THIS video?
        if (user.youtubeChannelId) {
            const ownsVideo = await youtubeService.verifyVideoBelongsToChannel(user.id, videoId, user.youtubeChannelId);
            if (!ownsVideo) {
                await logYouTubeAudit({
                    teacherId: user.id,
                    action: 'UNAUTHORIZED_PUBLISH_ATTEMPT',
                    status: 'FAILED',
                    courseId: course.id,
                    videoId: videoId,
                    metadata: { reason: "Video does not belong to linked channel" }
                });
                return NextResponse.json({ error: 'Video ownership verification failed. You can only add videos from your linked YouTube channel.' }, { status: 403 });
            }
        }

        // Fetch video details from YouTube
        let videoTitle = customTitle || `Lesson from ${course.title}`;
        let videoDescription = customDescription || '';
        let videoDuration = 0;

        try {
            const videoDetails = await youtubeService.getVideoDetails(user.id, videoId);
            if (videoDetails?.items?.[0]) {
                const item = videoDetails.items[0];
                videoTitle = customTitle || item.snippet?.title || videoTitle;
                videoDescription = customDescription || item.snippet?.description || '';
                // Parse ISO 8601 duration (PT1H2M3S → seconds)
                const iso = item.contentDetails?.duration || '';
                const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (match) {
                    videoDuration = (parseInt(match[1] || '0') * 3600) +
                        (parseInt(match[2] || '0') * 60) +
                        parseInt(match[3] || '0');
                }
            }
        } catch (detailErr) {
            console.warn('[AddVideo] Could not fetch YouTube video details:', detailErr);
        }

        // Security Step 2: Add video to strictly mapped course YouTube playlist
        let playlistItemId: string | null = null;
        let playlistIdToUse = course.youtubePlaylistId;

        if (user.youtubeChannelId) {
            try {
                // Strict guard enforces DB relationships over loose schema fields
                const mapping = await assertTeacherCanPublishToCoursePlaylist({
                    teacherId: user.id,
                    courseId: course.id,
                    oauthChannelId: user.youtubeChannelId
                });
                playlistIdToUse = mapping.playlistId;

                const { exists, itemId } = await youtubeService.isVideoAlreadyInPlaylist(user.id, playlistIdToUse, videoId);

                if (!exists) {
                    const addRes = await youtubeService.addVideoToPlaylist(user.id, playlistIdToUse, videoId);
                    playlistItemId = addRes?.id || null;
                    console.log(`[AddVideo] Added ${videoId} to playlist ${playlistIdToUse}`);
                } else {
                    playlistItemId = itemId || null;
                    console.log(`[AddVideo] Video ${videoId} already in playlist ${playlistIdToUse}`);
                }
            } catch (playlistErr: any) {
                console.warn('[AddVideo] Playlist add failed/rejected by guard:', playlistErr.message);
                // We do not fail the whole request just because auto-playlist sync failed
            }
        }

        // Get next lesson order number
        const lastLesson = await prisma.lesson.findFirst({
            where: { courseId: course.id },
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true },
        });
        const nextOrder = (lastLesson?.orderNumber || 0) + 1;

        // Create the lesson in DB
        const lesson = await prisma.lesson.create({
            data: {
                courseId: course.id,
                title: videoTitle,
                description: videoDescription,
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                youtube_video_id: videoId,
                contentType: 'video',
                orderNumber: nextOrder,
                isPublished: true,
                duration: videoDuration > 0 ? Math.round(videoDuration / 60) : undefined, // store in minutes
            },
        });

        return NextResponse.json({
            success: true,
            lesson,
            addedToPlaylist: !!course.youtubePlaylistId,
        });
    } catch (error: any) {
        console.error('[AddVideo] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to add video' }, { status: 500 });
    }
}
