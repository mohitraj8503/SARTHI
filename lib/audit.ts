import { prisma } from './prisma';

interface AuditLogParams {
  actorId: string;
  actorEmail: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorName: params.actorName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        changes: params.changes ? JSON.stringify(params.changes) : undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error('[AuditLog] Failed to create audit log:', error);
    // Don't throw, we don't want to block the primary action
  }
}
