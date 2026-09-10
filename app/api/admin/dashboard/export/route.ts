import { NextRequest } from 'next/server';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { getAdminDashboardCombinedData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Authorize admin session (requires 'admin' role)
    const admin = await requireAdmin('admin');
    
    // 2. Parse range parameters for telemetry aggregation
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    // 3. Fetch comprehensive platform metrics, events, and uptime checks
    const data = await getAdminDashboardCombinedData(range, 25); // Include up to 25 operational logs

    const executionTimeMs = Date.now() - startTime;

    return ApiResponse.success({
      adminName: admin.name || admin.email || 'Admin',
      metrics: data.metrics,
      revenueChartData: data.revenueChartData,
      activities: data.activities,
      alerts: data.alerts,
      health: data.health,
      meta: {
        filter: range,
        search: 'None',
        generatedAt: new Date().toISOString(),
        executionTimeMs
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
