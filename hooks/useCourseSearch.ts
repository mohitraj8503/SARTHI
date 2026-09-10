'use client'

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from './useDebouncedCallback';

export interface SearchFilters {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Smart Search Hook
 * Synchronizes search state with URL for deep-linking and SEO.
 */
export function useCourseSearch(initialQuery = '') {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  
  // Debounced URL synchronization
  const syncToUrl = useDebouncedCallback((newQuery: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQuery) params.set('q', newQuery);
    else params.delete('q');
    router.replace(`/courses?${params.toString()}`, { scroll: false });
  }, 400);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncToUrl(val);
  };

  const updateFilters = useCallback((filters: SearchFilters) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.replace(`/courses?${params.toString()}`, { scroll: false });
  }, [router]);

  return { query, setQuery: handleQueryChange, updateFilters };
}
