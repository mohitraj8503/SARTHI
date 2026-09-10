import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface Metrics {
  totalRevenue: number;
  revenueChangePct: number;
  activeStudents: number;
  activeStudentsChangePct: number;
  todaysEnrollment: number;
  todaysEnrollmentChangePct: number;
  completionRatePct: number;
  completionRateChangePct: number;
}

export interface RevenueDataPoint {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  actorName: string;
  timestamp: string;
}

export interface CombinedDashboardData {
  metrics: Metrics;
  revenueChartData: { label: string; value: number }[];
  activities: ActivityItem[];
}

export function useDashboardData(chartPeriod: 'week' | 'month') {
  // Use a single combined API call to reduce network overhead and improve TBT
  const { data, isLoading } = useQuery<CombinedDashboardData>({
    queryKey: ['admin', 'dashboard', 'combined', chartPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard/combined?range=${chartPeriod}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000,   // Keep in garbage collection for 5 minutes
  });

  const revenueChartData = useMemo(() => {
    return data?.revenueChartData?.length ? data.revenueChartData.map(d => ({
      name: d.label,
      val: d.value
    })) : [];
  }, [data?.revenueChartData]);

  return {
    metrics: data?.metrics,
    metricsLoading: isLoading,
    revenueChartData,
    activities: data?.activities || [],
    activitiesLoading: isLoading,
  };
}
