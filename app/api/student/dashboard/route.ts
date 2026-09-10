export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { authenticateStudent } from '@/lib/auth/middleware';
import { logError } from '@/lib/logger';
import { API } from '@/lib/api/response';

export async function GET(request: Request) {
  try {
    const userId = await authenticateStudent(request);
    
    // ✅ High-performance concurrent fetching with resiliency
    const [courses, grades, progress, notifications] = await Promise.allSettled([
      prisma.enrollment.findMany({ where: { userId, status: 'active' } }),
      prisma.assignmentSubmission.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.progress.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId, isRead: false }, take: 10 })
    ]);

    const hasCriticalFailure = 
      courses.status === 'rejected';
    
    if (hasCriticalFailure) {
      await logError('STUDENT_DASHBOARD_CRITICAL', { 
        userId, 
        errors: { courses: courses.status === 'rejected' ? courses.reason : null } 
      });
      
      return NextResponse.json(
        { success: false, error: 'Critical data unavailable', retryAfter: 30 },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.status === 'fulfilled' ? courses.value : [],
        submissions: grades.status === 'fulfilled' ? grades.value : [],
        progress: progress.status === 'fulfilled' ? progress.value : [],
        notifications: notifications.status === 'fulfilled' ? notifications.value : []
      },
      meta: { 
        partial: courses.status !== 'fulfilled' || grades.status !== 'fulfilled',
        timestamp: new Date().toISOString() 
      }
    });

  } catch (error: any) {
    await logError('STUDENT_DASHBOARD_UNHANDLED', { error: error.message });
    return API.server();
  }
}

