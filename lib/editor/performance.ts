/**
 * High-Performance Editor Utilities
 * Provides logic for virtualization and layout thrashing prevention.
 */
export class EditorPerformance {
  /**
   * Measures render duration and logs slow frames in development.
   */
  static measureRender(label: string, fn: () => void) {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      fn();
      const end = performance.now();
      if (end - start > 16.67) { // > 1 frame at 60fps
        console.warn(`[PERF] Slow ${label}: ${(end - start).toFixed(2)}ms`);
      }
    } else {
      fn();
    }
  }

  /**
   * Sanity check for large content blocks to prevent DOM bloat.
   */
  static validateContentVolume(html: string) {
    const size = new Blob([html]).size;
    return {
      sizeKb: size / 1024,
      isHeavy: size > 500 * 1024, // > 500KB
    };
  }
}
