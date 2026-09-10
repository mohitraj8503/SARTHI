import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateStudent } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateStudent(request);
    const body = await request.json();
    const { liveClassId, action } = body;

    if (!liveClassId || !action) {
      return ApiResponse.error('liveClassId and action are required', 'VALIDATION_ERROR', 400);
    }

    if (action === 'join') {
      // Create new attendance record or update existing
      const attendance = await prisma.liveClassAttendance.create({
        data: {
          liveClassId,
          studentId: userId,
          joinedAt: new Date()
        }
      });
      return ApiResponse.success(attendance, 'Joined live class.');
    } else if (action === 'leave') {
      // Find the last joined attendance for this student/class that hasn't been closed
      const lastAttendance = await prisma.liveClassAttendance.findFirst({
        where: {
          liveClassId,
          studentId: userId,
          leftAt: null
        },
        orderBy: { joinedAt: 'desc' }
      });

      if (lastAttendance) {
        const updated = await prisma.liveClassAttendance.update({
          where: { id: lastAttendance.id },
          data: { leftAt: new Date() }
        });
        return ApiResponse.success(updated, 'Left live class.');
      }

      return ApiResponse.success(null, 'No active attendance session found to close.');
    }

    return ApiResponse.error('Invalid action', 'VALIDATION_ERROR', 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
