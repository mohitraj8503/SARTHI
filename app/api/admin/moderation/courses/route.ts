import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

/**
 * GET /api/admin/moderation/courses
 * Returns courses pending content moderation review.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'PENDING_REVIEW';

    const courses = await prisma.course.findMany({
      where: {
        moderationStatus: status as any,
      },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' }
            }
          }
        },
        _count: { select: { lessons: true, enrollments: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, courses });

  } catch (error) {
    console.error('[COURSE_MOD_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/moderation/courses
 * Approve or reject a course's content.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, action, reason } = await req.json();

    if (!courseId || !['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      APPROVE: 'APPROVED',
      REJECT: 'REJECTED',
      REQUEST_CHANGES: 'CHANGES_REQUESTED',
    };

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        moderationStatus: statusMap[action] as any,
        moderationNote: reason || null,
        moderatedBy: session.userId,
        moderatedAt: new Date(),
        // Only publish if approved
        isPublished: action === 'APPROVE' ? true : undefined,
      }
    });

    await AuditLogger.log(
      action === 'APPROVE' ? AuditAction.COURSE_PUBLISHED : AuditAction.COURSE_HIDDEN,
      session.userId,
      'COURSE',
      courseId,
      { action, reason, courseName: updatedCourse.title }
    );

    return NextResponse.json({
      success: true,
      message: `Course ${action.toLowerCase()}d successfully.`,
      course: updatedCourse
    });

  } catch (error) {
    console.error('[COURSE_MOD_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
