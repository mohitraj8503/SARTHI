import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET /api/teacher/live
// List all live classes for this teacher
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const liveClasses = await prisma.liveClass.findMany({
      where: { teacherId: userId },
      include: {
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return ApiResponse.success({ liveClasses });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST /api/teacher/live
// Schedule a live class
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);
    const body = await request.json();
    const { title, description, courseId, scheduledAt } = body;

    if (!title || !courseId) {
      return ApiResponse.error('Title and Course ID are required', 'VALIDATION_ERROR', 400);
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        description,
        courseId,
        teacherId: userId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'SCHEDULED'
      }
    });

    return ApiResponse.success(liveClass, 'Live Class scheduled successfully.');
  } catch (error: any) {
    return handleApiError(error);
  }
}
