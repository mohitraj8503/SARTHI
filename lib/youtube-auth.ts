import { prisma } from '@/lib/prisma';

export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/**
 * STRICT AUTHORIZATION GUARD
 *
 * Asserts that a teacher is explicitly permitted to publish/upload to a course's YouTube playlist
 * using their currently authenticated YouTube channel.
 *
 * @param teacherId The ID of the authenticated user (teacher) on SARTHI
 * @param courseId The ID of the course they are trying to upload to
 * @param oauthChannelId The actual YouTube channel ID fetched via OAuth
 *
 * @returns The verified mapping which contains the safe `playlistId`
 * @throws ForbiddenError if any security rule is violated
 */
export async function assertTeacherCanPublishToCoursePlaylist({
    teacherId,
    courseId,
    oauthChannelId,
}: {
    teacherId: string;
    courseId: string;
    oauthChannelId: string;
}) {
    const mapping = await prisma.courseYouTubeMapping.findFirst({
        where: {
            teacherId,
            courseId,
            lockToTeacher: true,
            lockToChannel: true,
        },
    });

    if (!mapping) {
        console.error(`[Auth Guard] No strict playlist mapping found for Teacher: ${teacherId}, Course: ${courseId}`);
        throw new ForbiddenError('No authorized playlist mapping found for this course.');
    }

    if (mapping.youtubeChannelId !== oauthChannelId) {
        console.error(
            `[Auth Guard] Channel mismatch. Expected: ${mapping.youtubeChannelId}, Actual: ${oauthChannelId}`
        );
        throw new ForbiddenError('The connected YouTube Channel does not match the assigned channel for this course.');
    }

    return mapping;
}
