import { prisma } from '@/lib/prisma';

/**
 * Enterprise Teacher Audit Logger
 * Records critical instructor actions for security and monitoring.
 */
export async function logTeacherAction(params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    status?: 'success' | 'failure';
}) {
    try {
        await prisma.adminAuditLog.create({
            data: {
                adminId: params.userId, // Reusing admin audit log for teacher actions for now
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: JSON.stringify(params.details || {}),
                ipAddress: 'internal', // Could be passed from request
                userAgent: 'TeacherStudio/1.0'
            }
        });
        
        console.log(`[TEACHER_AUDIT] ${params.action} on ${params.entity}:${params.entityId} by ${params.userId}`);
    } catch (error) {
        console.error('[Teacher Audit Logger] Failed to record action:', error);
    }
}
