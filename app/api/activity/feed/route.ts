export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

// Activity action types
const ACTIVITY_ACTIONS = {
  ENROLLED: 'ENROLLED',
  LESSON_UPLOADED: 'LESSON_UPLOADED',
  COURSE_UPDATED: 'COURSE_UPDATED',
  COURSE_CREATED: 'COURSE_CREATED',
  SYSTEM_BACKUP_DONE: 'SYSTEM_BACKUP_DONE',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  STUDENT_REGISTERED: 'STUDENT_REGISTERED',
  TEACHER_REGISTERED: 'TEACHER_REGISTERED',
  ASSIGNMENT_SUBMITTED: 'ASSIGNMENT_SUBMITTED',
  ASSIGNMENT_GRADED: 'ASSIGNMENT_GRADED',
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
  SEMINAR_CREATED: 'SEMINAR_CREATED',
  SEMINAR_STARTED: 'SEMINAR_STARTED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  GENERIC: 'GENERIC',
} as const;

const SOURCE_TYPES = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  COURSES: 'courses',
  SYSTEM: 'system',
  PAYMENTS: 'payments',
} as const;

const SEVERITY_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

// GET /api/activity/feed - Get recent platform activities with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Pagination params
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Filter params
    const source = searchParams.get('source'); // students, teachers, courses, system, payments
    const q = searchParams.get('q'); // search query
    const severity = searchParams.get('severity'); // info, success, warning, critical
    const action = searchParams.get('action'); // specific action
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const res = await withResiliency(async () => {
      // Build where clause
      const where: any = {};

      if (source && source !== 'all') {
        where.source = source;
      }

      if (severity) {
        where.severity = severity;
      }

      if (action) {
        where.action = action;
      }

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp.gte = new Date(startDate);
        }
        if (endDate) {
          where.timestamp.lte = new Date(endDate);
        }
      }

      if (q) {
        where.OR = [
          { actorName: { contains: q } },
          { targetName: { contains: q } },
          { action: { contains: q } },
          { type: { contains: q } },
        ];
      }

      const cursorObj = cursor ? { id: cursor } : undefined;

      const activities = await prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit + 1,
        cursor: cursorObj,
        skip: cursor ? 1 : 0,
      });

      const totalCount = await prisma.activityLog.count({ where });

      const hasMore = activities.length > limit;
      const items = hasMore ? activities.slice(0, limit) : activities;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      const formattedActivities = items.map((activity) => ({
        id: activity.id,
        timestamp: activity.timestamp.toISOString(),
        source: activity.source,
        action: activity.action,
        severity: activity.severity,
        type: activity.type,
        actor: {
          name: activity.actorName,
          role: activity.actorRole,
          id: activity.actorId,
          avatarUrl: activity.actorAvatar,
        },
        entity: {
          type: activity.targetType,
          id: activity.targetId,
          name: activity.targetName,
        },
        meta: activity.metadata || {},
        isRead: activity.isRead,
        links: {
          entityUrl: getEntityUrl(activity),
          detailsUrl: `/admin/activity/${activity.id}`,
        },
      }));

      return {
        items: formattedActivities,
        nextCursor,
        hasMore,
        total: totalCount,
      };
    }, 'Activity Feed');

    if (!res.success || !res.data) {
      return NextResponse.json({ items: [], nextCursor: null, hasMore: false, total: 0 });
    }

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json({
      items: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    });
  }
}

// Helper function to get entity URL
function getEntityUrl(activity: any): string | null {
  if (!activity.targetType || !activity.targetId) return null;

  switch (activity.targetType) {
    case 'student':
      return `/admin/students/${activity.targetId}`;
    case 'teacher':
      return `/admin/teachers/${activity.targetId}`;
    case 'course':
      return `/admin/courses/${activity.targetId}`;
    case 'seminar':
      return `/admin/seminars/${activity.targetId}`;
    case 'payment':
      return `/admin/payments/${activity.targetId}`;
    default:
      return null;
  }
}

// POST /api/activity/feed - Create a new activity log entry (for server-side use)
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    // Only allow admin or system to create activity logs
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      action,
      severity = 'info',
      source,
      actorName,
      actorRole,
      actorId,
      actorAvatar,
      targetName,
      targetType,
      targetId,
      metadata,
    } = body;

    // Validate required fields
    if (!type || !actorName || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: type, actorName, source' },
        { status: 400 }
      );
    }

    // Create activity log
    const activity = await prisma.activityLog.create({
      data: {
        type,
        action: action || 'GENERIC',
        severity,
        source,
        actorName,
        actorRole,
        actorId,
        actorAvatar,
        targetName,
        targetType,
        targetId,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        timestamp: activity.timestamp.toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log', details: error.message },
      { status: 500 }
    );
  }
}

// Export activity data
export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const source = searchParams.get('source');
    const q = searchParams.get('q');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause (same as GET)
    const where: any = {};

    if (source && source !== 'all') {
      where.source = source;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    if (q) {
      where.OR = [
        { actorName: { contains: q } },
        { targetName: { contains: q } },
        { action: { contains: q } },
      ];
    }

    // Fetch all matching activities (limit to 10000 for export)
    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10000,
    });

    if (format === 'json') {
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        totalExported: activities.length,
        activities: activities.map(a => ({
          timestamp: a.timestamp.toISOString(),
          severity: a.severity,
          source: a.source,
          action: a.action,
          actorName: a.actorName,
          actorRole: a.actorRole,
          entityType: a.targetType,
          entityName: a.targetName,
          metaSummary: JSON.stringify(a.metadata || {}),
          eventId: a.id,
        })),
      });
    }

    // CSV format
    const csvHeaders = [
      'timestamp',
      'severity',
      'source',
      'action',
      'actorName',
      'actorRole',
      'entityType',
      'entityName',
      'metaSummary',
      'eventId',
    ];

    const csvRows = activities.map((a) => [
      a.timestamp.toISOString(),
      a.severity,
      a.source,
      a.action,
      a.actorName,
      a.actorRole || '',
      a.targetType || '',
      a.targetName || '',
      JSON.stringify(a.metadata || {}),
      a.id,
    ]);

    const csv = [csvHeaders.join(','), ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activity-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting activity:', error);
    return NextResponse.json(
      { error: 'Failed to export activities', details: error.message },
      { status: 500 }
    );
  }
}

