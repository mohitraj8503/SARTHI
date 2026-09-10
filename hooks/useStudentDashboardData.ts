'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '@/types/dashboard';

export function useStudentDashboardData() {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard_summary'],
    queryFn: async () => {
      const res = await fetch('/api/student/dashboard');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Failed to fetch dashboard') as Error & { status?: number };
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  return { data, isLoading, error, refetch };
}
