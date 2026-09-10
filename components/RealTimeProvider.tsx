'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Initialize Real-time synchronization
    // This hook connects to the Socket.io gateway and handles invalidation
    useRealtimeSync(user?.role, user?.id);

    return (
        <>
            {children}
        </>
    );
}

