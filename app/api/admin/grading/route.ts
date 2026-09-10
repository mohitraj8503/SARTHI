import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { PaginationSchema } from "@/lib/admin/validators/schemas";
import { auditAdminAction } from "@/lib/admin/audit-logs";

export const dynamic = 'force-dynamic';

/**
 * GET: List Submissions for Grading
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, status, sortBy, sortOrder } = query;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { lesson: { title: { contains: search } } }
      ];
    }

    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.findMany({
        where,
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          lesson: { 
            select: { 
              id: true, 
              title: true, 
              course: { select: { id: true, title: true } } 
            } 
          },
          gradedBy: { select: { name: true } }
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return ApiResponse.success(submissions, undefined, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Grade a Submission
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('Submission ID required', 'BAD_REQUEST', 400);

    const body = await req.json();
    const { grade, feedback, passed } = body;

    if (grade === undefined) return ApiResponse.error('Grade is required', 'BAD_REQUEST', 400);

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        grade: parseFloat(grade),
        feedback,
        passed: !!passed,
        status: 'COMPLETED',
        gradedById: admin.id,
        gradedAt: new Date()
      }
    });

    await auditAdminAction(admin, 'submission_grade', 'SUBMISSION', id, `Grade: ${grade}`, { grade, passed });

    return ApiResponse.success(submission, 'Submission graded successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

