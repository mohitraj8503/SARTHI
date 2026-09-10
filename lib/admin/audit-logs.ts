import { logAudit } from "@/lib/audit";

/**
 * Standard audit log wrapper for admin actions.
 */
export async function auditAdminAction(
  user: { id: string, email: string, name?: string },
  action: string,
  entityType: string,
  entityId: string,
  entityName?: string,
  changes?: Record<string, any>
) {
  try {
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorName: user.name,
      action,
      entityType,
      entityId,
      entityName,
      changes,
    });
  } catch (err) {
    console.error(`[AUDIT_LOG_ERROR] Action: ${action}`, err);
  }
}
