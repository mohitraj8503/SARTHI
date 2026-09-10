export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/activity/notifications - Get notifications
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const severity = searchParams.get('severity'); // critical, warning

    const where: any = {
      isRead: false,
    };

    if (severity) {
      where.severity = severity;
    } else {
      // Default to critical and warning only
      where.severity = {
        in: ['critical', 'warning'],
      };
    }

    const notifications = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        action: true,
        severity: true,
        source: true,
        actorName: true,
        targetName: true,
        timestamp: true,
        metadata: true,
      },
    });

    const unreadCount = await prisma.activityLog.count({
      where: {
        isRead: false,
        severity: { in: ['critical', 'warning'] },
      },
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        action: n.action,
        severity: n.severity,
        source: n.source,
        actorName: n.actorName,
        targetName: n.targetName,
        timestamp: n.timestamp.toISOString(),
        metadata: n.metadata,
      })),
      unreadCount,
    });
  } catch (error: any) {
    console.error('[Notifications API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/activity/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all as read
      await prisma.activityLog.updateMany({
        where: {
          isRead: false,
          severity: { in: ['critical', 'warning'] },
        },
        data: {
          isRead: true,
        },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.activityLog.updateMany({
        where: {
          id: { in: notificationIds },
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Notifications API]', error);
    return NextResponse.json(
      { error: 'Failed to update notifications', details: error.message },
      { status: 500 }
    );
  }
}

