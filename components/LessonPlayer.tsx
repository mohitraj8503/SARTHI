'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCcw, Maximize, Play, Pause, FastForward, Rewind, Volume2, VolumeX, Settings } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

// Use Mux Player for enterprise-grade adaptive streaming, mobile optimization, and accessibility
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-neutral-900 animate-pulse flex items-center justify-center rounded-3xl">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
});

interface LessonPlayerProps {
  url: string;
  lessonId: string;
  courseId: string;
  initialProgress?: number; // 0 to 1
  onComplete?: () => void;
  title?: string;
  onProgressUpdate?: (progress: number) => void;
}

export default function LessonPlayer({
  url,
  lessonId,
  courseId,
  initialProgress = 0,
  onComplete,
  title,
  onProgressUpdate
}: LessonPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(initialProgress);
  const [lastSavedProgress, setLastSavedProgress] = useState(initialProgress);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showCustomControls, setShowCustomControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);

  // Initialize
  useEffect(() => {
    setHasWindow(true);
    // Check for offline progress
    const offlineProgress = localStorage.getItem(`v_progress_${lessonId}`);
    if (offlineProgress) {
        const parsed = parseFloat(offlineProgress);
        if (parsed > initialProgress) {
            setPlayed(parsed);
            setLastSavedProgress(parsed);
        }
    }
  }, [lessonId, initialProgress]);

  // Persistent Progress Saver
  const saveProgress = useCallback(async (progressToSave: number, isManual = false) => {
    if (progressToSave <= lastSavedProgress && !isManual) return;
    
    setIsSaving(true);
    // Save to LocalStorage immediately (Offline Persistence)
    localStorage.setItem(`v_progress_${lessonId}`, progressToSave.toString());

    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId, progress: progressToSave }),
      });
      
      if (response.ok) {
        setLastSavedProgress(progressToSave);
        const data = await response.json();
        if (data.completed && onComplete) {
            triggerHaptic('success');
            setTimeout(onComplete, 1500);
        }
      }
    } catch (err) {
      console.error('Failed to sync progress to cloud:', err);
    } finally {
      setIsSaving(false);
    }
  }, [lessonId, courseId, lastSavedProgress, onComplete]);

  // Sync progress every 30 seconds if playing
  useEffect(() => {
    if (!playing || played < 0.05) return;
    const interval = setInterval(() => {
      saveProgress(played);
    }, 30000); 
    return () => clearInterval(interval);
  }, [playing, played, saveProgress]);

  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
    // Save every 10% progress threshold
    if (state.played - lastSavedProgress >= 0.10) {
      saveProgress(state.played);
    }
  };

  const handleReady = () => {
    setIsReady(true);
    setError(null);
    setRetryCount(0);
    // Seek to saved progress if available (Safety Guarded)
    if (initialProgress > 0 && playerRef.current) {
      try {
        const duration = playerRef.current.duration;
        if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
          playerRef.current.currentTime = initialProgress * duration;
        }
      } catch (e) {
        console.warn('Seek Protocol_Failed: Media engine not yet saturated.');
      }
    }
  };

  const handleError = (err: any) => {
    console.error('Video Playback Error:', err);
    setError('FAILED_TO_LOAD_MEDIA');
    triggerHaptic('error');
    if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          // Retry by reloading the component
          setIsReady(false);
        }, 3000);
    }
  };

  // Handle player clicks for mobile controls
  const handlePlayerClick = () => {
    if (window.innerWidth < 768) { // Mobile breakpoint
      setShowCustomControls(!showCustomControls);
      setTimeout(() => setShowCustomControls(false), 5000); // Auto-hide after 5s
    }
  };

  // Enhanced Keyboard Navigation Engine (WCAG AA Compliance)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Only active if focused on player container or document body
        const activeElement = document.activeElement;
        if (["INPUT", "TEXTAREA"].includes(activeElement?.tagName || "") &&
            !containerRef.current?.contains(activeElement)) return;

        // Focus player if not focused
        if (containerRef.current && !containerRef.current.contains(activeElement)) {
          containerRef.current.focus();
        }

        switch (e.code) {
            case "Space":
                e.preventDefault();
                setPlaying(prev => !prev);
                triggerHaptic("light");
                break;
            case "ArrowRight":
                e.preventDefault();
                if (playerRef.current) {
                  const currentTime = playerRef.current.currentTime || 0;
                  try { playerRef.current.currentTime = currentTime + 10; } catch {}
                  triggerHaptic('light');
                }
                break;
            case "ArrowLeft":
                e.preventDefault();
                if (playerRef.current) {
                  const currentTime = playerRef.current.currentTime || 0;
                  try { playerRef.current.currentTime = Math.max(0, currentTime - 10); } catch {}
                  triggerHaptic('light');
                }
                break;
            case "KeyM":
                e.preventDefault();
                setMuted(prev => !prev);
                break;
            case "KeyF":
                e.preventDefault();
                if (containerRef.current?.requestFullscreen) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    containerRef.current.requestFullscreen();
                  }
                }
                break;
            case "Digit1":
            case "Digit2":
            case "Digit3":
            case "Digit4":
                // Speed controls (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
                e.preventDefault();
                const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                const speedIndex = parseInt(e.code.slice(-1)) - 1;
                if (speedIndex >= 0 && speedIndex < speeds.length) {
                  setPlaybackRate(speeds[speedIndex]);
                  triggerHaptic('light');
                }
                break;
            case "KeyC":
                // Toggle captions (when available)
                e.preventDefault();
                // Implementation depends on caption availability
                break;
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Accessibility: Focus management
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute('tabindex', '0');
      containerRef.current.setAttribute('role', 'application');
      containerRef.current.setAttribute('aria-label', `Video player for ${title || 'course lesson'}`);
    }
  }, [title]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Swipe left/right for seeking (minimum 50px movement)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
      const seekAmount = deltaX > 0 ? 10 : -10;
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime || 0;
        try { playerRef.current.currentTime = Math.max(0, currentTime + seekAmount); } catch {}
        triggerHaptic('light');
      }
    }

    setTouchStart(null);
  };

  return (
    <div
        ref={containerRef}
        className={cn(
        "relative aspect-video rounded-[32px] overflow-hidden bg-black shadow-2xl group transition-all duration-500 ring-1 ring-white/10",
        !isReady && "animate-pulse",
        isFullscreen && "rounded-none"
    )}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    >
      {/* Premium Overlay UI */}
      <AnimatePresence>
        {error && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-neutral-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 italic">Matrix_Link_Lost</h3>
                <p className="text-neutral-400 max-w-xs mb-6 text-sm underline underline-offset-4 decoration-red-500/40">
                    {retryCount < 3 ? `RE-ESTABLISHING CONNECTION [${retryCount + 1}/3]...` : "CORE_SYNC_FAILURE: RELOAD PROTOCOL REQUIRED."}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reset_Engine
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Mobile Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-40 md:hidden transition-opacity duration-300",
          showCustomControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setShowCustomControls(false)}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (playerRef.current) {
                const currentTime = playerRef.current.currentTime || 0;
                playerRef.current.currentTime = Math.max(0, currentTime - 10);
                triggerHaptic('light');
              }
            }}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            aria-label="Rewind 10 seconds"
          >
            <Rewind className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(!playing);
              triggerHaptic('medium');
            }}
            className="p-4 bg-white backdrop-blur-md rounded-full text-black hover:scale-110 transition-all shadow-lg"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (playerRef.current) {
                const currentTime = playerRef.current.currentTime || 0;
                playerRef.current.currentTime = currentTime + 10;
                triggerHaptic('light');
              }
            }}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            aria-label="Fast forward 10 seconds"
          >
            <FastForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      <MuxPlayer
        ref={playerRef}
        playbackId={url.includes('mux.com') ? url.split('/').pop() : undefined}
        src={url}
        metadata={{
          video_title: title || "Course Lesson",
          video_id: lessonId,
        }}
        streamType="on-demand"
        autoPlay={false}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        startTime={initialProgress > 0 ? initialProgress * (playerRef.current?.duration || 0) : 0}
        onPlay={() => {
          setPlaying(true);
          triggerHaptic('light');
        }}
        onPause={() => {
          setPlaying(false);
          saveProgress(played, true);
        }}
        onTimeUpdate={(e: any) => {
          const currentTime = e.target.currentTime;
          const duration = e.target.duration;
          const progress = duration > 0 ? currentTime / duration : 0;
          setPlayed(progress);

          // Save every 10% progress threshold
          if (progress - lastSavedProgress >= 0.10) {
            saveProgress(progress);
          }
        }}
        onEnded={() => {
          saveProgress(1, true);
          triggerHaptic('success');
          if (onComplete) setTimeout(onComplete, 1500);
        }}
        onError={(error: any) => {
          console.error('Mux Player Error:', error);
          setError('FAILED_TO_LOAD_MEDIA');
          triggerHaptic('error');
          if (retryCount < 3) {
            setTimeout(() => setRetryCount(prev => prev + 1), 3000);
          }
        }}
        onLoadedData={() => {
          setIsReady(true);
          setError(null);
          setRetryCount(0);
        }}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
        // Accessibility features
        aria-label={`Video player for ${title || 'course lesson'}`}
        crossOrigin="anonymous"
        // Mobile optimization
        playsInline
        disablePictureInPicture={false}
      />

      {/* Touch hint for mobile */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          Tap to show controls • Swipe to seek
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[32px] z-10 shadow-inner" />
    </div>
  );
}

// Framer transitions for the error state
import { motion, AnimatePresence } from 'framer-motion';

