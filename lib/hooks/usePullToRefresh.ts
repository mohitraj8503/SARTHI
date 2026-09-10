import { useState, useEffect, useCallback } from 'react';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    disabled?: boolean;
}

export function usePullToRefresh({ onRefresh, threshold = 80, disabled = false }: PullToRefreshOptions) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const [canRefresh, setCanRefresh] = useState(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing) return;

        // Only enable pull-to-refresh at the top of the page
        if (window.scrollY > 10) return;

        setStartY(e.touches[0].clientY);
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing || startY === 0) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY);

        if (distance > 0) {
            e.preventDefault();
            setPullDistance(distance);
            setCanRefresh(distance >= threshold);
        }
    }, [disabled, isRefreshing, startY, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (disabled || isRefreshing || startY === 0) return;

        if (canRefresh) {
            setIsRefreshing(true);
            setCanRefresh(false);

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
        setStartY(0);
    }, [disabled, isRefreshing, canRefresh, onRefresh, startY]);

    useEffect(() => {
        if (disabled) return;

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

    return {
        isRefreshing,
        pullDistance,
        canRefresh,
        progress: Math.min(100, (pullDistance / threshold) * 100)
    };
}