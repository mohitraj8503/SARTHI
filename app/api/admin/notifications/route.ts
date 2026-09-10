export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {
      userId: user.id
    };
    
    if (unreadOnly) {
      where.isRead = false;
    }

    // For admin, we might want to show system-wide notifications or notifications addressed to admin
    // For now, let's show recent notifications across the platform or admin-specific ones

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    return ApiResponse.success({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        isRead: n.isRead,
        href: n.href,
        meta: n.meta ? JSON.parse(n.meta) : null,
        createdAt: n.createdAt,
        user: n.user
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      unreadCount
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

