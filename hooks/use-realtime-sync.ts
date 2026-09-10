'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Helper functions to check user roles consistently
const isAdminRole = (role: string | undefined): boolean => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return roleLower === 'admin' || roleLower === 'administrator' || roleLower === 'admin-room';
};

const isTeacherRole = (role: string | undefined): boolean => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return roleLower === 'teacher' || roleLower === 'instructor' || roleLower === 'teaching';
};

const isStudentRole = (role: string | undefined): boolean => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return roleLower === 'student' || roleLower === 'learner';
};

import { sseManager } from '@/lib/realtime/sse-manager';

export function useRealtimeSync(role?: string, userId?: string) {
  const queryClient = useQueryClient();

  const handleEvent = useCallback((payload: any) => {
    console.log('🔄 Sync Event Received:', payload.type);
    
    const eventType = payload.type;
    const entity = payload.payload?.entity;
    const data = payload.payload?.data;

    // ... (logic remains same, but I'll paste the whole thing to be safe and clean)
    if (isAdminRole(role)) {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (eventType.includes('student') || eventType.includes('teacher')) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
      }
      if (eventType.includes('course')) queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (eventType.includes('payment') || eventType.includes('enrollment')) {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      }
    }

    if (isTeacherRole(role) && data?.teacherId === userId) {
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-revenue'] });
    }

    if (isStudentRole(role) && data?.studentId === userId) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    }

    if (entity) {
      queryClient.invalidateQueries({ queryKey: [entity], exact: false });
    }

    if (eventType.includes('enrollment') || eventType.includes('course')) {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }

    if (eventType.includes('registered') || eventType.includes('enrolled') || eventType.includes('created')) {
      queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
    }
  }, [queryClient, role, userId]);

  useEffect(() => {
    if (!userId) return;

    // Build the SSE URL
    const baseUrl = '/api/realtime';
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (userId) params.set('userId', userId);
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    // Connect via singleton manager
    sseManager.connect(url);

    // Subscribe to events
    const unsubscribe = sseManager.subscribe(handleEvent);

    return () => {
      unsubscribe();
    };
  }, [handleEvent, role, userId]);


  // Return a mock-socket interface to satisfy legacy components that expect .on()
  return {
    on: (event: string, _cb: (...args: any[]) => void) => {
      console.log(`📡 Subscribed to standard event: ${event}`);
    },
    off: (event: string, _cb: (...args: any[]) => void) => {
      console.log(`📡 Unsubscribed from standard event: ${event}`);
    },
    // Expose connection status
    isConnected: () => sseManager.isConnected(),
  };
}
