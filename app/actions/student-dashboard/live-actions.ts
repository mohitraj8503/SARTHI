"use server";
import { prisma } from '@/lib/prisma';
import { getCurrentUser, IS_CONN_ERROR } from './index';
import { withResiliency } from '@/lib/resilient-db';

export async function getLiveLessons() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', liveNow: [], upcoming: [], recordings: [] };

    const result = await withResiliency(async () => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: 'active' },
            select: { courseId: true }
        });
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        if (enrolledCourseIds.length === 0) {
            return { liveNow: [], upcoming: [], recordings: [] };
        }

        const [liveNow, upcoming, recordings] = await Promise.all([
            prisma.seminar.findMany({
                where: {
                    status: 'LIVE',
                    courseId: { in: enrolledCourseIds }
                },
                include: {
                    speaker: { include: { user: { select: { name: true, image: true } } } },
                    course: { select: { title: true } }
                }
            }),
            prisma.seminar.findMany({
                where: {
                    status: 'SCHEDULED',
                    scheduledAt: { gte: new Date() },
                    courseId: { in: enrolledCourseIds }
                },
                orderBy: { scheduledAt: 'asc' },
                include: {
                    speaker: { include: { user: { select: { name: true, image: true } } } },
                    course: { select: { title: true } }
                }
            }),
            prisma.seminar.findMany({
                where: {
                    status: 'ENDED',
                    recordingVideoId: { not: null },
                    courseId: { in: enrolledCourseIds }
                },
                orderBy: { scheduledAt: 'desc' },
                include: {
                    speaker: { include: { user: { select: { name: true } } } },
                    course: { select: { title: true } }
                }
            })
        ]);

        return {
            liveNow: liveNow.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                instructor: s.speaker?.user?.name || 'TBA',
                instructorImage: s.speaker?.user?.image,
                joinLink: `/dashboard/live/${s.id}`
            })),
            upcoming: upcoming.map(s => ({
                id: s.id,
                title: s.title,
                startTime: s.scheduledAt,
                instructor: s.speaker?.user?.name || 'TBA',
                courseName: s.course?.title
            })),
            recordings: recordings.map(r => ({
                id: r.id,
                title: r.title,
                date: r.scheduledAt,
                duration: r.durationMinutes || 60,
                thumbnail: r.thumbnail || `https://img.youtube.com/vi/${r.recordingVideoId}/mqdefault.jpg`,
                videoId: r.recordingVideoId,
                courseName: r.course?.title
            }))
        };
    }, `live-lessons-${user.id}`);

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', liveNow: [], upcoming: [], recordings: [] };
    }

    return result.data;
}

export async function getVideoLibrary() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', videos: [] };

    const result = await withResiliency(async () => {
        const videos = await prisma.video.findMany({
            where: { status: 'processed' },
            include: {
                teacher: { select: { name: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const library = videos.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            duration: v.duration,
            thumbnail: `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`,
            course: v.course.title,
            instructor: v.teacher.name,
            uploadedAt: v.createdAt
        }));

        return { videos: library };
    }, 'video-library');

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', videos: [] };
    }

    return result.data;
}

