import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import { PaginationSchema } from '@/lib/admin/validators/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, sortBy, sortOrder, status, role } = (query as any);

    const skip = (page - 1) * pageSize;
    const where: any = {
      status: { not: 'DELETED' }
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    if (status && status !== 'ALL' && status !== 'All') {
      where.status = status.toUpperCase();
    }

    if (role && role !== 'ALL' && role !== 'All') {
      where.role = role.toUpperCase();
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar_url: true,
          image: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return ApiResponse.success({ users }, undefined, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { action, userId, data } = body;

    if (!action) return ApiResponse.error('Action required', 'ACTION_MISSING', 400);

    let targetUser: any;

    switch (action) {
      case 'suspend':
        targetUser = await prisma.user.update({
          where: { id: userId },
          data: { status: 'SUSPENDED' }
        });
        break;
      case 'activate':
        targetUser = await prisma.user.update({
          where: { id: userId },
          data: { status: 'ACTIVE' }
        });
        break;
      case 'ban':
        targetUser = await prisma.user.update({
          where: { id: userId },
          data: { status: 'BANNED' }
        });
        break;
      case 'reset-password':
        const tempPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        targetUser = await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });
        // We return the temp password only in this case
        return ApiResponse.success({ tempPassword }, 'Password reset successfully');
      default:
        return ApiResponse.error(`Invalid action: ${action}`, 'INVALID_ACTION', 400);
    }

    await auditAdminAction(
      admin,
      `user_${action}`,
      'USER',
      targetUser.id,
      targetUser.name || targetUser.email,
      { action, data }
    );

    return ApiResponse.success(targetUser, `Operation ${action} finalized successfully`);
  } catch (error) {
    return handleApiError(error);
  }
}

