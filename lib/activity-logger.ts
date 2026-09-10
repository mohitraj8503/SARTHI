import { prisma } from './prisma';

// Activity log types
export const ACTIVITY_ACTIONS = {
  ENROLLED: 'ENROLLED',
  LESSON_UPLOADED: 'LESSON_UPLOADED',
  COURSE_UPDATED: 'COURSE_UPDATED',
  COURSE_CREATED: 'COURSE_CREATED',
  SYSTEM_BACKUP_DONE: 'SYSTEM_BACKUP_DONE',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  STUDENT_REGISTERED: 'STUDENT_REGISTERED',
  TEACHER_REGISTERED: 'TEACHER_REGISTERED',
  TEACHER_ASSIGNED: 'TEACHER_ASSIGNED',
  ASSIGNMENT_SUBMITTED: 'ASSIGNMENT_SUBMITTED',
  ASSIGNMENT_GRADED: 'ASSIGNMENT_GRADED',
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
  SEMINAR_CREATED: 'SEMINAR_CREATED',
  SEMINAR_STARTED: 'SEMINAR_STARTED',
  SEMINAR_ENDED: 'SEMINAR_ENDED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  COURSE_PUBLISHED: 'COURSE_PUBLISHED',
  COURSE_UNPUBLISHED: 'COURSE_UNPUBLISHED',
  LESSON_CREATED: 'LESSON_CREATED',
  LESSON_DELETED: 'LESSON_DELETED',
  VIDEO_UPLOADED: 'VIDEO_UPLOADED',
  NOTE_ADDED: 'NOTE_ADDED',
  PROGRESS_UPDATED: 'PROGRESS_UPDATED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_WARNING: 'SYSTEM_WARNING',
  GENERIC: 'GENERIC',
} as const;

export const SOURCE_TYPES = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  COURSES: 'courses',
  SYSTEM: 'system',
  PAYMENTS: 'payments',
} as const;

export const SEVERITY_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export type ActivityAction = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS];
export type SourceType = typeof SOURCE_TYPES[keyof typeof SOURCE_TYPES];
export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

export interface LogActivityParams {
  type: string;
  action: ActivityAction;
  severity?: SeverityLevel;
  source: SourceType;
  actorName: string;
  actorRole?: string;
  actorId?: string;
  actorAvatar?: string;
  targetName?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  userId?: string;
}

/**
 * Log an activity event to the ActivityLog table
 * This should be called from server-side code only to maintain audit integrity
 */
export async function logActivityEvent(params: LogActivityParams) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        type: params.type,
        action: params.action,
        severity: params.severity || SEVERITY_LEVELS.INFO,
        source: params.source,
        actorName: params.actorName,
        actorRole: params.actorRole,
        actorId: params.actorId,
        actorAvatar: params.actorAvatar,
        targetName: params.targetName,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        userId: params.userId,
        timestamp: new Date(),
      },
    });

    return { success: true, id: activity.id };
  } catch (error) {
    console.error('[ActivityLogger] Failed to log activity:', error);
    // Don't throw - activity logging should not break main flow
    return { success: false, error };
  }
}

// Convenience functions for common activity logging scenarios

export async function logEnrollment(params: {
  studentName: string;
  studentId: string;
  courseName: string;
  courseId: string;
}) {
  return logActivityEvent({
    type: 'enrollment',
    action: ACTIVITY_ACTIONS.ENROLLED,
    severity: SEVERITY_LEVELS.SUCCESS,
    source: SOURCE_TYPES.STUDENTS,
    actorName: params.studentName,
    actorRole: 'student',
    actorId: params.studentId,
    targetName: params.courseName,
    targetType: 'course',
    targetId: params.courseId,
    userId: params.studentId,
    metadata: { enrollmentType: 'course' },
  });
}

export async function logPayment(params: {
  userName: string;
  userId: string;
  amount: number;
  courseName?: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
}) {
  return logActivityEvent({
    type: 'payment',
    action: params.status === 'success' 
      ? ACTIVITY_ACTIONS.PAYMENT_SUCCESS 
      : params.status === 'failed'
      ? ACTIVITY_ACTIONS.PAYMENT_FAILED
      : ACTIVITY_ACTIONS.PAYMENT_PENDING,
    severity: params.status === 'success' 
      ? SEVERITY_LEVELS.SUCCESS 
      : params.status === 'failed'
      ? SEVERITY_LEVELS.CRITICAL
      : SEVERITY_LEVELS.WARNING,
    source: SOURCE_TYPES.PAYMENTS,
    actorName: params.userName,
    actorRole: 'student',
    actorId: params.userId,
    targetName: params.courseName,
    targetType: 'course',
    userId: params.userId,
    metadata: { 
      amount: params.amount,
      transactionId: params.transactionId,
    },
  });
}

export async function logLessonUpload(params: {
  teacherName: string;
  teacherId: string;
  lessonName: string;
  courseName: string;
  courseId: string;
}) {
  return logActivityEvent({
    type: 'lesson_upload',
    action: ACTIVITY_ACTIONS.LESSON_UPLOADED,
    severity: SEVERITY_LEVELS.SUCCESS,
    source: SOURCE_TYPES.TEACHERS,
    actorName: params.teacherName,
    actorRole: 'teacher',
    actorId: params.teacherId,
    targetName: params.lessonName,
    targetType: 'lesson',
    targetId: params.courseId,
    metadata: { courseName: params.courseName },
  });
}

export async function logCourseUpdate(params: {
  actorName: string;
  actorId: string;
  actorRole: string;
  courseName: string;
  courseId: string;
  changes?: Record<string, any>;
}) {
  return logActivityEvent({
    type: 'course_update',
    action: ACTIVITY_ACTIONS.COURSE_UPDATED,
    severity: SEVERITY_LEVELS.INFO,
    source: SOURCE_TYPES.COURSES,
    actorName: params.actorName,
    actorRole: params.actorRole,
    actorId: params.actorId,
    targetName: params.courseName,
    targetType: 'course',
    targetId: params.courseId,
    metadata: params.changes || {},
  });
}

export async function logSystemBackup(params: {
  status: 'success' | 'failed';
  details?: string;
}) {
  return logActivityEvent({
    type: 'system_backup',
    action: ACTIVITY_ACTIONS.SYSTEM_BACKUP_DONE,
    severity: params.status === 'success' ? SEVERITY_LEVELS.SUCCESS : SEVERITY_LEVELS.CRITICAL,
    source: SOURCE_TYPES.SYSTEM,
    actorName: 'System',
    actorRole: 'system',
    metadata: { details: params.details, status: params.status },
  });
}

export async function logAuthEvent(params: {
  userName: string;
  userId: string;
  action: 'login' | 'logout' | 'login_failed';
  ip?: string;
  userAgent?: string;
}) {
  return logActivityEvent({
    type: 'auth',
    action: params.action === 'login' 
      ? ACTIVITY_ACTIONS.AUTH_LOGIN 
      : params.action === 'logout'
      ? ACTIVITY_ACTIONS.AUTH_LOGOUT
      : ACTIVITY_ACTIONS.AUTH_LOGIN_FAILED,
    severity: params.action === 'login_failed' ? SEVERITY_LEVELS.WARNING : SEVERITY_LEVELS.INFO,
    source: SOURCE_TYPES.SYSTEM,
    actorName: params.userName,
    actorRole: 'user',
    actorId: params.userId,
    userId: params.userId,
    metadata: { ip: params.ip, userAgent: params.userAgent },
  });
}

export async function logCertificateIssuance(params: {
  studentName: string;
  studentId: string;
  courseName: string;
  certificateId: string;
}) {
  return logActivityEvent({
    type: 'certificate',
    action: ACTIVITY_ACTIONS.CERTIFICATE_ISSUED,
    severity: SEVERITY_LEVELS.SUCCESS,
    source: SOURCE_TYPES.STUDENTS,
    actorName: params.studentName,
    actorRole: 'student',
    actorId: params.studentId,
    targetName: params.courseName,
    targetType: 'certificate',
    targetId: params.certificateId,
    userId: params.studentId,
  });
}
