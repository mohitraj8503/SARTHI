import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStudents, activeThisWeek, newThisMonth] = await Promise.all([
      prisma.user.count({ 
        where: { 
          role: 'STUDENT',
          status: { not: 'DELETED' }
        } 
      }),
      prisma.user.count({ 
        where: { 
          role: 'STUDENT', 
          status: { not: 'DELETED' },
          OR: [{ lastLogin: { gte: weekAgo } }, { lastActive: { gte: weekAgo } }] 
        } 
      }),
      prisma.user.count({ 
        where: { 
          role: 'STUDENT', 
          status: { not: 'DELETED' },
          createdAt: { gte: monthStart } 
        } 
      })
    ]);

    return ApiResponse.success({
      totalStudents,
      activeThisWeek,
      newThisMonth,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

