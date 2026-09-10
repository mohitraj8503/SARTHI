import { prisma } from '@/lib/prisma';

export interface CreateNotificationData {
  title: string;
  body?: string;
  type: string;
  href?: string;
  meta?: Record<string, any>;
  userId?: string; 
  severity?: 'info' | 'success' | 'warning' | 'critical';
  source?: 'students' | 'teachers' | 'courses' | 'system' | 'payments';
}

/**
 * Modern Administrator Notification System
 * Updates Notification table (Drawer), ActivityLog (Feed), and emits real-time Socket events
 */
export async function createAdminNotification(data: CreateNotificationData) {
  try {
    const { title, body, type, href, meta, userId, severity = 'info', source = 'system' } = data;

    // 1. Get recipients (All admin roles as defined in layout)
    const adminRoles = ['admin', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];
    const admins = userId 
      ? [{ id: userId }] 
      : await prisma.user.findMany({
          where: { role: { in: adminRoles }, status: 'ACTIVE' },
          select: { id: true }
        });

    if (admins.length === 0) return;

    // 2. Create Inbox Notifications (for the Drawer)
    const notifications = await Promise.all(admins.map(admin => 
      prisma.notification.create({
        data: {
          userId: admin.id,
          title,
          body,
          type,
          href,
          meta: meta ? JSON.stringify(meta) : null
        }
      })
    ));

    // 3. Create Activity Log (for the Recent Activity feed)
    // We only create ONE activity log entry for the event, not one per admin
    await prisma.activityLog.create({
      data: {
        type,
        action: type.toUpperCase(),
        severity,
        source,
        actorName: 'System', // Can be refined if actor is known
        targetName: title,
        targetId: href || null,
        metadata: meta ? JSON.stringify(meta) : null,
        timestamp: new Date(),
      }
    }).catch(e => console.error('[Notifications] Activity log failed:', e));

    // 4. Emit Real-time Socket Events
    try {
      const { emitNotification } = await import('@/lib/realtime/socket-server');
      admins.forEach((admin, index) => {
        // Use the matching notification from the created list
        emitNotification(admin.id, notifications[index]);
      });
    } catch (socketError) {
      // Socket might not be available in all contexts (e.g. some scripts)
    }

    console.log(`[Admin Notification] Broadcasted to ${admins.length} admins: ${title}`);
  } catch (error) {
    console.error('[Admin Notification] Failed:', error);
  }
}

/**
 * Mark notifications as read for a user
 */
export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  try {
    if (notificationIds && notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId
        },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true }
      });
    }
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}
