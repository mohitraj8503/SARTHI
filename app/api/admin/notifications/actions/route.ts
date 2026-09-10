export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { action, notificationId, notificationIds } = body;

    switch (action) {
      case 'mark-read':
        if (!notificationId) return ApiResponse.error('Notification ID required', 'BAD_REQUEST', 400);

        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true }
        });

        return ApiResponse.success({ message: 'Notification marked as read' });

      case 'mark-all-read':
        await prisma.notification.updateMany({
          where: { isRead: false },
          data: { isRead: true }
        });

        return ApiResponse.success({ message: 'All notifications marked as read' });

      case 'delete':
        if (!notificationId) return ApiResponse.error('Notification ID required', 'BAD_REQUEST', 400);

        await prisma.notification.delete({
          where: { id: notificationId }
        });

        return ApiResponse.success({ message: 'Notification deleted' });

      case 'bulk-delete':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return ApiResponse.error('Notification IDs array required', 'BAD_REQUEST', 400);
        }

        await prisma.notification.deleteMany({
          where: { id: { in: notificationIds } }
        });

        return ApiResponse.success({ message: `${notificationIds.length} notifications deleted` });

      default:
        return ApiResponse.error('Invalid action', 'BAD_REQUEST', 400);
    }
  } catch (error: any) {
    return handleApiError(error);
  }
}

