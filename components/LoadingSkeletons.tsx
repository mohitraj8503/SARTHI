import React from 'react';

export function TableLoadingSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className="space-y-4 p-6">
            {/* Header skeleton */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
            </div>

            {/* Row skeletons */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <div key={colIdx} className="space-y-2">
                            {colIdx === 0 ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                                </div>
                            ) : (
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardLoadingSkeleton({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        </div>
    );
}

