'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tt-page-zoom';
export const DEFAULT_ZOOM = 1.0;
export const MIN_ZOOM = 0.7;
export const MAX_ZOOM = 2.0;
export const ZOOM_STEP = 0.1;

/** Returns the default zoom level (always 1.0 = 100%) */
export function getDefaultZoom() {
  return 1.0;
}

/**
 * Applies a zoom level to the document root and fixes height so no scrollbar appears.
 * Works for both Chrome/Edge (zoom CSS property) and modern browsers.
 */
export function applyDocumentZoom(zoom: number, isDesktop: boolean) {
  if (!isDesktop) {
    // Reset everything on mobile
    document.documentElement.style.zoom = '';
    document.documentElement.style.height = '';
    document.documentElement.style.minHeight = '';
    document.documentElement.style.overflow = '';
    document.body.style.height = '';
    document.body.style.minHeight = '';
    document.body.style.overflow = '';
    return;
  }

  const inverse = (100 / zoom).toFixed(4);
  document.documentElement.style.zoom = String(zoom);
  document.documentElement.style.height = `${inverse}vh`;
  document.documentElement.style.minHeight = `${inverse}vh`;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.height = `${inverse}vh`;
  document.body.style.minHeight = `${inverse}vh`;
  document.body.style.overflow = 'hidden';

  // Set zoom tier so pages can adapt spacing via CSS/JS
  // tier: 'low' < 1.1 | 'normal' 1.1–1.55 | 'high' > 1.55
  const tier = zoom <= 1.1 ? 'low' : zoom <= 1.55 ? 'normal' : 'high';
  document.documentElement.setAttribute('data-zoom-tier', tier);

  // CSS custom properties for fine-grained spacing control
  // These scale DOWN as zoom increases (so content still fits)
  const spacingScale = Math.min(1, getDefaultZoom() / zoom); // 1.0 at default, <1 when zoomed in
  document.documentElement.style.setProperty('--auth-spacing-scale', String(spacingScale.toFixed(3)));
}


/** Dispatch a custom event so all listeners on the same page update their state. */
function broadcastZoom(zoom: number) {
  window.dispatchEvent(new CustomEvent('tt-zoom-change', { detail: { zoom } }));
}

/**
 * Hook that returns the current zoom and a setter.
 * Syncs to localStorage and broadcasts changes via custom event.
 */
export function usePageZoom() {
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);

    // Load saved zoom from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved ? parseFloat(saved) : getDefaultZoom();
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initial));
    setZoom(clamped);
    applyDocumentZoom(clamped, desktop);

    const handleResize = () => {
      const d = window.innerWidth >= 1024;
      setIsDesktop(d);
      const current = parseFloat(localStorage.getItem(STORAGE_KEY) || String(getDefaultZoom()));
      applyDocumentZoom(current, d);
    };

    const handleZoomChange = (e: Event) => {
      const detail = (e as CustomEvent<{ zoom: number }>).detail;
      setZoom(detail.zoom);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('tt-zoom-change', handleZoomChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('tt-zoom-change', handleZoomChange);
      // Cleanup zoom on unmount
      document.documentElement.style.zoom = '';
      document.documentElement.style.height = '';
      document.documentElement.style.minHeight = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
    };
  }, []);

  const setAndApplyZoom = (newZoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(newZoom * 10) / 10));
    localStorage.setItem(STORAGE_KEY, String(clamped));
    applyDocumentZoom(clamped, isDesktop);
    broadcastZoom(clamped);
    setZoom(clamped);
  };

  return { zoom, isDesktop, setZoom: setAndApplyZoom };
}
