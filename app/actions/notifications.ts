'use server';

import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

// --- Authentication Helper ---
async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, role: session.role };
}

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications(status: 'all' | 'unread' = 'all') {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED', items: [] };

  try {
      const result = await withResiliency(async () => {
        const items = await prisma.notification.findMany({
          where: {
            userId: user.id,
            ...(status === 'unread' ? { isRead: false } : {})
          },
          orderBy: { createdAt: 'desc' },
          take: 20 // Limit to first 20 for performance
        });

        const unreadCount = await prisma.notification.count({
          where: { userId: user.id, isRead: false }
        });

        return { items, unreadCount };
      });

      if (!result.success) {
        return { error: result.error || 'DB_CONNECTION_FAILED', items: [] };
      }

      return result.data;
  } catch (error) {
    console.error('[Actions] getNotifications error:', error);
    return { error: 'DB_CONNECTION_FAILED', items: [] };
  }
}

/**
 * Quick preview for bell icon (latest 8)
 */
export async function getNotificationPreview() {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED', items: [], unreadCount: 0 };

  try {
      const result = await withResiliency(async () => {
        const items = await prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 8
        });

        const unreadCount = await prisma.notification.count({
          where: { userId: user.id, isRead: false }
        });

        return { items, unreadCount };
      });

      if (!result.success) {
        return { error: result.error || 'DB_CONNECTION_FAILED', items: [], unreadCount: 0 };
      }

      return result.data;
  } catch (error) {
    return { error: 'DB_CONNECTION_FAILED', items: [], unreadCount: 0 };
  }
}

/**
 * Mark a specific notification as read
 */
export async function markAsRead(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };

  try {
    await withResiliency(async () => {
      await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { isRead: true }
      });
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'DB_CONNECTION_FAILED' };
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsRead() {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };

  try {
    await withResiliency(async () => {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      });
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'DB_CONNECTION_FAILED' };
  }
}

/**
 * Internal helper to create a notification and trigger real-time alert
 * This should be used by other server actions (e.g., when a grade is posted)
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  body?: string;
  type: string;
  href?: string;
  meta?: any;
}) {
  try {
    const notification = await (prisma.notification.create as any)({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        href: data.href,
        meta: data.meta ? JSON.stringify(data.meta) : null
      }
    });

    // Emit socket event for real-time update
    try {
      const { emitNotification } = await import('@/lib/realtime/socket-server');
      emitNotification(data.userId, notification);
    } catch (socketError) {
      console.error('[Actions] Failed to emit socket notification:', socketError);
    }

    return { success: true, notification };
  } catch (error) {
    console.error('[Actions] createNotification error:', error);
    return { success: false, error };
  }
}

