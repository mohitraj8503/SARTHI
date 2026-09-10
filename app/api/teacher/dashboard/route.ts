import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { withResiliency } from '@/lib/resilient-db';
import { subMonths, subDays } from 'date-fns';
import { API } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const teacherId = await authenticateTeacher(request);
    const { getTeacherDashboardData } = await import('@/lib/teacher/dashboard-data');
    const dashboardResult = await getTeacherDashboardData(teacherId);

    if (dashboardResult.success && dashboardResult.data) {
      return API.ok(dashboardResult.data);
    }

    // Handle partial failure / degraded state
    return API.err('Service in degraded mode', 'DEGRADED_DASHBOARD', 503, {
      partial: dashboardResult.data
    });

  } catch (error) {
    console.error('❌ Dashboard API Failure:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden();

    return API.server('Dashboard data engine failure');
  }
}

