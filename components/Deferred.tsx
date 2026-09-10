'use client';

import { useState, useEffect } from 'react';

/**
 * Higher-order component that defers rendering of its children 
 * until the browser main thread is idle (requestIdleCallback).
 * Critical for reducing TBT and improving LCP on mobile devices.
 */
export function Deferred({
    children,
    fallback = null,
    delay = 0
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    delay?: number;
}) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const render = () => {
            if (delay > 0) {
                setTimeout(() => setShouldRender(true), delay);
            } else {
                setShouldRender(true);
            }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const handle = (window as any).requestIdleCallback(() => render(), { timeout: 2000 });
            return () => (window as any).cancelIdleCallback(handle);
        } else {
            const timer = setTimeout(render, 300);
            return () => clearTimeout(timer);
        }
    }, [delay]);

    if (!shouldRender) return fallback;
    return <>{children}</>;
}

