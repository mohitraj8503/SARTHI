import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import { PaginationSchema } from '@/lib/admin/validators/schemas';

export const dynamic = 'force-dynamic';

/**
 * GET: List Password Reset Requests
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, status } = query;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [total, requests] = await Promise.all([
      prisma.passwordResetRequest.count({ where }),
      prisma.passwordResetRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return ApiResponse.success(requests, undefined, {
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
 * POST: Create a new password reset request (can be used by admin for a student)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { userId, reason } = body;

    if (!userId) return ApiResponse.error('User ID required', 'BAD_REQUEST', 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) return ApiResponse.error('User not found', 'NOT_FOUND', 404);

    const request = await prisma.passwordResetRequest.create({
      data: {
        userId,
        userEmail: user.email,
        userName: user.name,
        reason: reason || 'Requested by admin',
        status: 'PENDING'
      }
    });

    await auditAdminAction(admin, 'password_reset_request_create', 'USER', userId, user.name || user.email);

    return ApiResponse.success(request, 'Password reset request created');
  } catch (error) {
    return handleApiError(error);
  }
}

