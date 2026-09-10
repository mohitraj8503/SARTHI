import { useEffect, useRef, useCallback } from 'react';

/**
 * Reusable performance utility for debouncing callbacks.
 * Essential for search inputs and rapid UI interactions.
 * 
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
) {
  const timeout = useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    
    timeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
