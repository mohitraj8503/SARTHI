export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";

export async function GET() {
    try {
        await requireAdmin();

        const [total, published, draft, archived, enrollments] = await Promise.all([
            prisma.course.count({ where: { isActive: true } }),
            prisma.course.count({ where: { isPublished: true, isActive: true } }),
            prisma.course.count({ where: { isPublished: false, isActive: true } }),
            prisma.course.count({ where: { isActive: false } }),
        ]);

        // Optimized aggregation using database-level grouping
        const [courseTotals, courseCompleted] = await Promise.all([
          prisma.enrollment.groupBy({
            by: ['courseId'],
            _count: true
          }),
          prisma.enrollment.groupBy({
            by: ['courseId'],
            where: { OR: [{ progressPercentage: 100 }, { completedAt: { not: null } }] },
            _count: true
          })
        ]);

        const completedMap = new Map(courseCompleted.map(c => [c.courseId, c._count]));
        const rates = courseTotals.map(t => {
          const completed = completedMap.get(t.courseId) || 0;
          return (completed / t._count) * 100;
        });

        const avgCompletion = rates.length > 0
            ? Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
            : 0;

        return ApiResponse.success({
            total,
            published,
            draft,
            archived,
            avgCompletion: Number(avgCompletion),
            hasEnrollments: courseTotals.length > 0,
            // Tab counts for status tabs
            tabCounts: {
                all: total,
                published: published,
                draft: draft,
                archived: archived
            }
        });
    } catch (error: any) {
        return handleApiError(error);
    }
}

