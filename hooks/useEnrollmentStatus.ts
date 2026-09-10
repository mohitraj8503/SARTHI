import { useState, useEffect } from 'react';

export interface EnrollmentStatus {
    enrolled: boolean;
    enrollment: {
        id: string;
        userId: string;
        courseId: string;
        enrolledAt: string;
        progressPercentage?: number;
        lastAccessedAt?: string;
        course: {
            id: string;
            title: string;
            thumbnail: string | null;
        };
    } | null;
    lastWatched?: {
        id: string;
        title: string;
        orderNumber: number;
    } | null;
    shouldShow?: 'continue_learning' | 'enroll_now';
}

/**
 * Hook to fetch real-time enrollment status from database
 * This replaces the old localStorage-based enrollment checking
 */
export function useEnrollmentStatus(courseId: string | null, userId: string | null) {
    const [status, setStatus] = useState<EnrollmentStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId || !userId) {
            setLoading(false);
            setStatus({ enrolled: false, enrollment: null });
            return;
        }

        let isCancelled = false;

        async function fetchEnrollmentStatus() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/enrollments/status?courseId=${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!isCancelled) {
                    setStatus(data);
                }
            } catch (err: unknown) {
                if (!isCancelled) {
                    console.error('[useEnrollmentStatus] Error:', err);
                    setError(err instanceof Error ? err.message : 'Failed to check enrollment');
                    setStatus({ enrolled: false, enrollment: null });
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        fetchEnrollmentStatus();

        // Cleanup function
        return () => {
            isCancelled = true;
        };
    }, [courseId, userId]);

    return { status, loading, error, refetch: () => { } };
}
