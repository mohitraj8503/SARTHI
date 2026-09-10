import { prisma } from '@/lib/prisma';

type AuditAction =
    | 'CHANNEL_CONNECTED'
    | 'PLAYLIST_VERIFIED'
    | 'BROADCAST_CREATED'
    | 'GO_LIVE_STARTED'
    | 'LIVE_ENDED'
    | 'ARCHIVE_LINKED'
    | 'PLAYLIST_INSERT_FAILED'
    | 'UNAUTHORIZED_PUBLISH_ATTEMPT';

export async function logYouTubeAudit({
    teacherId,
    action,
    status,
    courseId,
    playlistId,
    videoId,
    metadata,
}: {
    teacherId: string;
    action: AuditAction;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    courseId?: string;
    playlistId?: string;
    videoId?: string;
    metadata?: Record<string, unknown>;
}) {
    try {
        await prisma.youTubeAuditLog.create({
            data: {
                teacherId,
                action,
                status,
                courseId,
                playlistId,
                videoId,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });
    } catch (error) {
        console.error('[YouTube Audit] Failed to write audit log:', error);
    }
}
