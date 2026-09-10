'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
    children: React.ReactNode;
    offset?: string;
}

export default function LazySection({ children, offset = '200px' }: LazySectionProps) {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (!('IntersectionObserver' in window)) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: offset,
                threshold: 0.01
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [offset, isInView]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            ref={containerRef}
            className="optimize-performance"
            style={{
                minHeight: isInView ? 'auto' : '100px',
                containIntrinsicSize: isInView ? undefined : 'auto 500px'
            }}
        >
            {isInView && mounted ? (
                <div className="w-full animate-in fade-in duration-700 ease-out">
                    {children}
                </div>
            ) : (
                <div
                    className="w-full h-[500px] bg-transparent opacity-0 pointer-events-none"
                    aria-hidden="true"
                    tabIndex={-1}
                />
            )}
        </div>
    );
}

