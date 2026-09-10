'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  navigationTime: number;
  errorRate: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiResponseTime: 0,
    navigationTime: 0,
    errorRate: 0,
  });

  const pathname = usePathname();

  useEffect(() => {
    // Measure initial load time
    if (window.performance) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        setMetrics(prev => ({ ...prev, loadTime: nav.duration }));
      }
    }

    // Monitor API calls
    const originalFetch = window.fetch;
    let apiCalls = 0;
    let apiErrors = 0;
    let totalResponseTime = 0;

    window.fetch = async (...args) => {
      const start = performance.now();
      apiCalls++;

      try {
        const result = await originalFetch(...args);
        const responseTime = performance.now() - start;
        totalResponseTime += responseTime;

        setMetrics(prev => ({
          ...prev,
          apiResponseTime: totalResponseTime / apiCalls,
          errorRate: (apiErrors / apiCalls) * 100,
        }));

        return result;
      } catch (error) {
        apiErrors++;
        setMetrics(prev => ({
          ...prev,
          errorRate: (apiErrors / apiCalls) * 100,
        }));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Track client-side navigation time
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const diff = end - start;
      if (diff > 0 && diff < 10000) { // Filter out outliers
        setMetrics(prev => ({ ...prev, navigationTime: diff }));
      }
    };
  }, [pathname]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest z-[100] border border-white/10 shadow-2xl backdrop-blur-md">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Initial Load</span>
          <span className={metrics.loadTime < 1000 ? 'text-emerald-400' : 'text-amber-400'}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Avg API</span>
          <span className={metrics.apiResponseTime < 250 ? 'text-emerald-400' : 'text-amber-400'}>
            {metrics.apiResponseTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Navigation</span>
          <span className={metrics.navigationTime < 100 ? 'text-emerald-400' : 'text-amber-400'}>
            {metrics.navigationTime.toFixed(0)}ms
          </span>
        </div>
        {metrics.errorRate > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">Errors</span>
            <span className="text-rose-400">{metrics.errorRate.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

