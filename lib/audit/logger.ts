import { prisma } from '@/lib/prisma';

export enum AuditAction {
  // Teacher Lifecycle
  TEACHER_APPLICATION_SUBMITTED = 'TEACHER_APPLICATION_SUBMITTED',
  TEACHER_APPLICATION_DRAFT_SAVED = 'TEACHER_APPLICATION_DRAFT_SAVED',
  TEACHER_APPLICATION_RESET = 'TEACHER_APPLICATION_RESET',
  TEACHER_APPROVED = 'TEACHER_APPROVED',
  TEACHER_REJECTED = 'TEACHER_REJECTED',
  TEACHER_CHANGES_REQUESTED = 'TEACHER_CHANGES_REQUESTED',
  TEACHER_SUSPENDED = 'TEACHER_SUSPENDED',
  TEACHER_DOCS_VIEWED = 'TEACHER_DOCS_VIEWED',
  
  // Content Actions
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_PUBLISHED = 'COURSE_PUBLISHED',
  COURSE_HIDDEN = 'COURSE_HIDDEN',
  LESSON_UPLOADED = 'LESSON_UPLOADED',
  
  // Classroom Actions
  CLASS_STARTED = 'CLASS_STARTED',
  CLASS_ENDED = 'CLASS_ENDED',
  
  // Admin Actions
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',

  // Monitoring & Governance
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  INCIDENT_RAISED = 'INCIDENT_RAISED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  SESSION_KILL_SWITCH = 'SESSION_KILL_SWITCH',
  ADMIN_SILENT_JOIN = 'ADMIN_SILENT_JOIN',
}

export class AuditLogger {
  /**
   * Logs an action to the database for admin oversight.
   */
  static async log(
    action: AuditAction | string,
    actorId: string,
    targetType: string,
    targetId: string,
    details?: any,
    ip?: string
  ) {
    try {
      await prisma.adminAuditLog.create({
        data: {
          adminId: actorId, // In our schema, this is the user performing the action
          action: action.toString(),
          targetType,
          targetId,
          details: details ? JSON.stringify(details) : null,
          ipAddress: ip || null,
        }
      });
      
      // Also log to console in dev for visibility
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${action} by ${actorId} on ${targetType}:${targetId}`);
      }
    } catch (error) {
      console.error('[AUDIT_LOG_ERROR]', error);
      // We don't throw to avoid breaking the main flow, but we log the error
    }
  }

  /**
   * Shorthand for teacher related logs
   */
  static async teacher(action: AuditAction, actorId: string, teacherId: string, details?: any) {
    return this.log(action, actorId, 'TEACHER', teacherId, details);
  }

  /**
   * Shorthand for course related logs
   */
  static async course(action: AuditAction, actorId: string, courseId: string, details?: any) {
    return this.log(action, actorId, 'COURSE', courseId, details);
  }
}
