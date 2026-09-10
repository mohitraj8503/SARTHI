import { prisma } from "./prisma";

/**
 * Logs an administrative action to the ActivityLog table.
 * This is used for audit trails and populating the Admin Dashboard activity feed.
 */
export async function logAdminActivity({
  userId,
  actorName,
  type,
  targetId,
  targetName,
  description,
  metadata
}: {
  userId: string;
  actorName: string;
  type: string;
  targetId?: string;
  targetName?: string;
  description: string;
  metadata?: any;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        actorName,
        type,
        action: type,
        targetId,
        targetName,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date()
      }
    });
  } catch (error) {
    // We don't want to crash the main request if logging fails, 
    // but we should log the error to the console.
    console.error("[logAdminActivity] Failed to log activity:", error);
  }
}

/**
 * Standard activity types for easy filtering and consistent descriptions
 */
export const ActivityType = {
  COURSE_CREATED: "COURSE_CREATED",
  COURSE_UPDATED: "COURSE_UPDATED",
  COURSE_DELETED: "COURSE_DELETED",
  COURSE_STATUS_TOGGLE: "COURSE_STATUS_TOGGLE",
  SEMINAR_APPROVED: "SEMINAR_APPROVED",
  SEMINAR_REJECTED: "SEMINAR_REJECTED",
  SEMINAR_CREATED: "SEMINAR_CREATED",
  WORKSHOP_CREATED: "WORKSHOP_CREATED",
  STUDENT_CREATED: "STUDENT_CREATED",
  STUDENT_UPDATED: "STUDENT_UPDATED",
  STUDENT_DEACTIVATED: "STUDENT_DEACTIVATED",
  STUDENT_SUSPENDED: "STUDENT_SUSPENDED",
  STUDENT_RESTORED: "STUDENT_RESTORED",
  BLOG_WRITER_APPROVED: "BLOG_WRITER_APPROVED",
  BLOG_WRITER_REJECTED: "BLOG_WRITER_REJECTED",
  STAFF_ROLE_CHANGE: "STAFF_ROLE_CHANGE",
  STAFF_INVITED: "STAFF_INVITED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  CERTIFICATE_ISSUED: "CERTIFICATE_ISSUED"
};
