export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { auditAdminAction } from "@/lib/admin/audit-logs";
import { logAdminActivity, ActivityType } from "@/lib/admin-logging";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin('staff');

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        instructor: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true 
          } 
        },
        _count: { 
          select: { 
            enrollments: true
          } 
        }
      }
    });

    if (!course) {
      return ApiResponse.error("Course not found", "NOT_FOUND", 404);
    }

    // Get enrollment stats
    const enrollmentStats = await prisma.enrollment.groupBy({
      by: ['status'],
      where: { courseId: params.id },
      _count: { status: true }
    });

    const stats = {
      active: 0,
      completed: 0,
      expired: 0,
      revoked: 0
    };

    enrollmentStats.forEach(e => {
      const status = e.status.toLowerCase();
      if (status === 'active') stats.active = e._count.status;
      else if (status === 'completed') stats.completed = e._count.status;
      else if (status === 'expired') stats.expired = e._count.status;
      else if (status === 'revoked') stats.revoked = e._count.status;
    });

    // Get average completion for this course
    const enrollmentsWithProgress = await prisma.enrollment.findMany({
      where: { courseId: params.id },
      select: { progressPercentage: true }
    });

    const avgCompletion = enrollmentsWithProgress.length > 0
      ? enrollmentsWithProgress.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollmentsWithProgress.length
      : 0;

    // Get recent reviews
    let reviews: any[] = [];
    let avgRating = 0;
    
    try {
      reviews = await prisma.courseReview.findMany({
        where: { courseId: params.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, image: true } } }
      });
      
      if (reviews.length > 0) {
        avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      }
    } catch (e) {
      console.warn("Reviews table access issue");
    }

    return ApiResponse.success({
      ...course,
      enrollmentStats: stats,
      avgCompletion: Math.round(avgCompletion * 10) / 10,
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await requireAdmin('management');
    const body = await req.json();
    
    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { title: true, isPublished: true, isActive: true }
    });

    if (!existing) {
      return ApiResponse.error("Course not found", "NOT_FOUND", 404);
    }

    const { 
      title, 
      description, 
      category, 
      price, 
      isPublished, 
      isActive,
      publishState,
      thumbnail,
      instructorId 
    } = body;

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isActive !== undefined && { isActive }),
        ...(publishState && { publish_state: publishState }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(instructorId && { instructorId })
      }
    });

    // Audit Log (Detailed)
    await auditAdminAction(
      admin,
      'COURSE_UPDATE',
      'COURSE',
      params.id,
      course.title,
      { changes: body }
    );

    // Activity Feed (Dashboard)
    await logAdminActivity({
      userId: admin.id,
      actorName: admin.name || "Admin",
      type: ActivityType.COURSE_UPDATED,
      targetId: course.id,
      targetName: course.title,
      description: `Updated course: ${course.title}`,
      metadata: { changes: Object.keys(body) }
    });

    return ApiResponse.success(course, "Course updated successfully");
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await requireAdmin('admin');

    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { title: true }
    });

    if (!existing) {
      return ApiResponse.error("Course not found", "NOT_FOUND", 404);
    }

    // Soft delete - just mark as inactive
    const course = await prisma.course.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        isPublished: false,
        publish_state: 'archived'
      }
    });

    // Audit Log
    await auditAdminAction(admin, 'COURSE_ARCHIVE', 'COURSE', params.id, existing.title);

    // Activity Feed
    await logAdminActivity({
      userId: admin.id,
      actorName: admin.name || "Admin",
      type: ActivityType.COURSE_DELETED,
      targetId: params.id,
      targetName: existing.title,
      description: `Archived course: ${existing.title}`
    });

    return ApiResponse.success(course, "Course archived successfully");
  } catch (error: any) {
    return handleApiError(error);
  }
}
