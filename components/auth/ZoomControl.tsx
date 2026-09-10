'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { usePageZoom, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, getDefaultZoom } from '@/lib/usePageZoom';

/**
 * Zoom control that lives on the right edge of the screen.
 *
 * Normal state  → only a slim green tab is visible (4px wide).
 * Hover state   → the full pill slides in from the right showing +, %, −.
 * Click %       → resets zoom to default.
 */
export function ZoomControl() {
  const { zoom, setZoom } = usePageZoom();
  const [hovered, setHovered] = useState(false);

  const percent    = Math.round(zoom * 100);
  const canZoomIn  = zoom < MAX_ZOOM - 0.001;
  const canZoomOut = zoom > MIN_ZOOM + 0.001;

  const zoomIn    = () => canZoomIn  && setZoom(zoom + ZOOM_STEP);
  const zoomOut   = () => canZoomOut && setZoom(zoom - ZOOM_STEP);
  const resetZoom = () => setZoom(getDefaultZoom());

  return (
    /**
     * Outer wrapper — always 56 px wide and anchored to the right edge.
     * This gives a reliable hover zone even when the panel is slid off-screen.
     */
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 200,
        width: 56,
        height: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {/* ── Green peek tab — fades out when hovered ── */}
      <motion.div
        animate={{ opacity: hovered ? 0 : 1, scaleY: hovered ? 0.8 : 1 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          right: 0,
          width: 5,
          height: 64,
          borderRadius: '6px 0 0 6px',
          background: 'linear-gradient(180deg, #4ade80 0%, #166534 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Sliding panel — off-screen normally, slides in on hover ── */}
      <motion.div
        animate={{ x: hovered ? 0 : 50 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        style={{
          position: 'absolute',
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 46,
          borderRadius: '14px 0 0 14px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(34,197,94,0.25)',
          borderRight: 'none',
          boxShadow: '-6px 0 28px rgba(22,101,52,0.16), inset 0 1px 0 rgba(255,255,255,1)',
          overflow: 'hidden',
        }}
      >
        {/* Top gradient accent */}
        <div style={{
          width: '100%',
          height: 3,
          background: 'linear-gradient(90deg, #22c55e, #166534)',
          flexShrink: 0,
        }} />

        {/* + button */}
        <motion.button
          onClick={zoomIn}
          disabled={!canZoomIn}
          whileHover={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
          whileTap={{ scale: 0.86 }}
          title="Zoom In"
          style={{
            width: '100%',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: canZoomIn ? '#166534' : '#d1d5db',
            cursor: canZoomIn ? 'pointer' : 'not-allowed',
            background: 'transparent',
            border: 'none',
            flexShrink: 0,
          }}
        >
          <Plus size={16} strokeWidth={2.8} />
        </motion.button>

        {/* Divider */}
        <div style={{ width: '60%', height: 1, background: 'rgba(34,197,94,0.18)', flexShrink: 0 }} />

        {/* % display — click to reset */}
        <motion.button
          onClick={resetZoom}
          whileHover={{ backgroundColor: 'rgba(34,197,94,0.08)' }}
          whileTap={{ scale: 0.92 }}
          title={`Reset to ${Math.round(getDefaultZoom() * 100)}%`}
          style={{
            width: '100%',
            height: 38,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 900, color: '#166534', lineHeight: 1, letterSpacing: '-0.5px' }}>
            {percent}
          </span>
          <span style={{ fontSize: 7, fontWeight: 800, color: '#22c55e', letterSpacing: '1px', lineHeight: 1, textTransform: 'uppercase' }}>
            zoom
          </span>
        </motion.button>

        {/* Divider */}
        <div style={{ width: '60%', height: 1, background: 'rgba(34,197,94,0.18)', flexShrink: 0 }} />

        {/* − button */}
        <motion.button
          onClick={zoomOut}
          disabled={!canZoomOut}
          whileHover={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
          whileTap={{ scale: 0.86 }}
          title="Zoom Out"
          style={{
            width: '100%',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: canZoomOut ? '#166534' : '#d1d5db',
            cursor: canZoomOut ? 'pointer' : 'not-allowed',
            background: 'transparent',
            border: 'none',
            flexShrink: 0,
          }}
        >
          <Minus size={16} strokeWidth={2.8} />
        </motion.button>

        {/* Bottom gradient accent */}
        <div style={{
          width: '100%',
          height: 3,
          background: 'linear-gradient(90deg, #22c55e, #166534)',
          flexShrink: 0,
        }} />
      </motion.div>
    </div>
  );
}
