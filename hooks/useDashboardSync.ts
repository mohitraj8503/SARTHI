import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Dashboard Sync Hook
 * Automatically syncs data between Student, Teacher, and Admin dashboards
 * Polls database every 30 seconds for fresh data
 */
export function useDashboardSync(userId?: string, role?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !role) return;

    // Define what data to sync based on role
    const syncKeys = (() => {
      switch (role) {
        case 'STUDENT':
          return [
            ['user', userId],
            ['courses', userId],
            ['enrollments', userId],
            ['progress', userId],
            ['assignments', userId],
            ['achievements', userId],
          ];
        case 'TEACHER':
          return [
            ['user', userId],
            ['teacher-courses', userId],
            ['students', userId],
            ['submissions', userId],
            ['analytics', userId],
          ];
        case 'ADMIN':
          return [
            ['users'],
            ['all-courses'],
            ['platform-stats'],
            ['pending-approvals'],
            ['dashboard', 'admin'],
          ];
        default:
          return [['user', userId]];
      }
    })();

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      console.log(`[Dashboard Sync] Refreshing ${role} data...`);
      
      syncKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [userId, role, queryClient]);

  // Manual refresh function
  const forceSync = () => {
    console.log('[Dashboard Sync] Force refresh triggered');
    queryClient.invalidateQueries();
  };

  return { forceSync };
}

/**
 * Cross-Dashboard Event Sync
 * Syncs specific events across dashboards
 */
export function useCrossDashboardSync() {
  const queryClient = useQueryClient();

  const syncEvent = (eventType: string, data?: any) => {
    console.log(`[Cross-Dashboard Sync] ${eventType}`, data);

    switch (eventType) {
      case 'ENROLLMENT_CREATED':
        // Student enrolled → Refresh teacher's student count
        queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        break;

      case 'LESSON_COMPLETED':
        // Student completed lesson → Refresh teacher analytics
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
        break;

      case 'ASSIGNMENT_SUBMITTED':
        // Student submitted → Refresh teacher's grading queue
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        break;

      case 'ASSIGNMENT_GRADED':
        // Teacher graded → Refresh student's assignments
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        break;

      case 'COURSE_UPDATED':
        // Teacher updated course → Refresh student's course view
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        break;

      case 'USER_UPDATED':
        // Profile updated → Refresh all user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
        break;

      default:
        console.warn(`Unknown sync event: ${eventType}`);
    }
  };

  return { syncEvent };
}
