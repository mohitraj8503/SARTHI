'use client';

import { useState, useEffect, useRef, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { extractGoogleDriveFileId, getGoogleDriveDirectUrl, getGoogleDriveEmbedUrl } from '@/lib/video-utils';

// Use Mux Player for enterprise-grade adaptive streaming
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-neutral-950 animate-pulse flex items-center justify-center rounded-3xl">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  )
});

// Fallback React Player for YouTube and other sources
const ReactPlayer: any = dynamic(() => import('react-player').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-neutral-950 animate-pulse flex items-center justify-center rounded-3xl">
      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
    </div>
  )
});

interface UnifiedVideoPlayerProps {
  // Video sources
  src?: string;
  youtubeId?: string;
  muxPlaybackId?: string;

  // Metadata
  title?: string;
  lessonId?: string;
  courseId?: string;
  poster?: string;

  // Playback options
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;

  // Progress & completion
  initialProgress?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;

  // Accessibility
  captions?: Array<{
    src: string;
    label: string;
    lang: string;
  }>;

  // Mobile optimization
  playsInline?: boolean;

  // Styling
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '9/16';

  // Aspect ratio auto-detection callback
  onAspectRatioDetect?: (isVertical: boolean, ratioStr: string) => void;

  // Advanced features
  enableHaptics?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableMobileControls?: boolean;
}

export const UnifiedVideoPlayer = memo(forwardRef(({
  src,
  youtubeId,
  muxPlaybackId,
  title = 'Video',
  lessonId,
  courseId,
  poster = '/course-thumbnails/gst-income-tax-combo.png',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  initialProgress = 0,
  onProgress,
  onComplete,
  onAspectRatioDetect,
  captions = [],
  playsInline = true,
  className = '',
  aspectRatio = '16/9',
  enableHaptics = true,
  enableKeyboardShortcuts = true,
  enableMobileControls = true
}: UnifiedVideoPlayerProps, ref) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Google Drive auto-parsing & URL conversion
  const gdriveId = extractGoogleDriveFileId(src);
  const isGdrive = !!gdriveId;
  const directSrc = isGdrive ? getGoogleDriveDirectUrl(src) : src;
  const embedSrc = isGdrive ? getGoogleDriveEmbedUrl(src) : '';

  // State management for Google Drive iframe fallback
  const [useGdriveFallback, setUseGdriveFallback] = useState(false);

  // Determine video source
  const videoSource = muxPlaybackId ? 'mux' : youtubeId ? 'youtube' : 'direct';
  const finalSrc = muxPlaybackId
    ? `https://stream.mux.com/${muxPlaybackId}.m3u8`
    : youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : directSrc;

  // State management
  const [isReady, setIsReady] = useState(videoSource === 'direct');
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      if (!playerRef.current) return 0;
      if (videoSource === 'mux' || videoSource === 'direct') {
        return playerRef.current.currentTime || (played * duration);
      } else {
        return playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : (played * duration);
      }
    }
  }));

  // Sync playback properties with HTML5 video element directly
  useEffect(() => {
    if (videoSource === 'direct' && playerRef.current) {
      try {
        playerRef.current.playbackRate = playbackRate;
      } catch (e) {}
    }
  }, [playbackRate, videoSource]);

  useEffect(() => {
    if (videoSource === 'direct' && playerRef.current) {
      try {
        playerRef.current.volume = volume;
        playerRef.current.muted = isMuted;
      } catch (e) {}
    }
  }, [volume, isMuted, videoSource]);

  // Controls overlay auto-hide logic
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  // Format time (MM:SS or HH:MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Playback Control Handlers
  const handleTogglePlay = useCallback(() => {
    resetHideTimer();
    setIsPlaying(prev => {
      const next = !prev;
      const player = playerRef.current;
      if (player) {
        if (videoSource === 'direct') {
          if (next) {
            player.play?.().catch(() => {});
          } else {
            player.pause?.();
          }
        }
      }
      if (enableHaptics) triggerHaptic(next ? 'medium' : 'light');
      return next;
    });
  }, [videoSource, enableHaptics, resetHideTimer]);

  const handleSkip = useCallback((deltaSeconds: number) => {
    resetHideTimer();
    const player = playerRef.current;
    if (!player) return;

    let curTime = played * duration;
    if (videoSource === 'direct' || videoSource === 'mux') {
      curTime = player.currentTime || curTime;
    } else if (player.getCurrentTime) {
      curTime = player.getCurrentTime();
    }

    const newTime = Math.min(duration > 0 ? duration : 9999, Math.max(0, curTime + deltaSeconds));

    if (videoSource === 'direct' || videoSource === 'mux') {
      player.currentTime = newTime;
    } else if (player.seekTo) {
      player.seekTo(newTime);
    }

    if (duration > 0) {
      const newProgress = newTime / duration;
      setPlayed(newProgress);
    }
    if (enableHaptics) triggerHaptic('light');
  }, [played, duration, videoSource, enableHaptics, resetHideTimer]);

  const handleSeek = useCallback((progressFraction: number) => {
    resetHideTimer();
    const targetProgress = Math.min(1, Math.max(0, progressFraction));
    setPlayed(targetProgress);

    const player = playerRef.current;
    if (!player) return;

    const targetTime = targetProgress * duration;
    if (videoSource === 'direct' || videoSource === 'mux') {
      player.currentTime = targetTime;
    } else if (player.seekTo) {
      player.seekTo(targetTime);
    }
  }, [duration, videoSource, resetHideTimer]);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  // Progress saving with debouncing
  const [lastSavedProgress, setLastSavedProgress] = useState(initialProgress);

  const saveProgress = useCallback(async (progressToSave: number) => {
    if (!lessonId || !courseId || progressToSave <= lastSavedProgress) return;

    try {
      localStorage.setItem(`v_progress_${lessonId}`, progressToSave.toString());
      const response = await fetch('/api/courses/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          progress: progressToSave,
          timestamp: Date.now()
        }),
      });

      if (response.ok) {
        setLastSavedProgress(progressToSave);
        onProgress?.(progressToSave);

        if (progressToSave >= 0.95 && onComplete) {
          onComplete();
          if (enableHaptics) triggerHaptic('success');
        }
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [lessonId, courseId, lastSavedProgress, onProgress, onComplete, enableHaptics]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (["INPUT", "TEXTAREA"].includes(activeElement?.tagName || "") &&
          !containerRef.current?.contains(activeElement)) return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "ArrowRight":
        case "KeyL":
          e.preventDefault();
          handleSkip(10);
          break;
        case "ArrowLeft":
        case "KeyJ":
          e.preventDefault();
          handleSkip(-10);
          break;
        case "KeyM":
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case "KeyF":
          e.preventDefault();
          handleToggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, handleTogglePlay, handleSkip, handleToggleFullscreen]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Broadcast video playing state to hide floating UI widgets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('video-play-state', { detail: { isPlaying } }));
      if (isPlaying) {
        document.body.classList.add('video-playing');
      } else {
        document.body.classList.remove('video-playing');
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('video-play-state', { detail: { isPlaying: false } }));
        document.body.classList.remove('video-playing');
      }
    };
  }, [isPlaying]);

  // Catch unhandled promise rejections for media.play() AbortError
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || event.reason?.name || '';
      if (
        event.reason?.name === 'AbortError' ||
        msg.includes('interrupted') ||
        msg.includes('removed from the document')
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  // Progress tracking
  const handleProgress = useCallback((progress: number) => {
    setPlayed(progress);
    if (progress - lastSavedProgress >= 0.10) {
      saveProgress(progress);
    }
  }, [lastSavedProgress, saveProgress]);

  // Render appropriate underlying player
  const renderPlayer = () => {
    if (videoSource === 'mux' && muxPlaybackId) {
      return (
        <MuxPlayer
          ref={playerRef}
          playbackId={muxPlaybackId}
          nocontrols={true}
          poster={poster}
          metadata={{
            video_title: title,
            video_id: lessonId,
          }}
          streamType="on-demand"
          startTime={initialProgress > 0 ? initialProgress * duration : 0}
          onTimeUpdate={(e: any) => {
            const currentTime = e.target.currentTime;
            const progress = duration > 0 ? currentTime / duration : 0;
            handleProgress(progress);
          }}
          onLoadedData={(e: any) => {
            setIsReady(true);
            if (e.target.duration) setDuration(e.target.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onComplete) onComplete();
          }}
          className="w-full h-full object-cover"
          aria-label={`Video player for ${title}`}
          crossOrigin="anonymous"
        />
      );
    }

    if (useGdriveFallback && embedSrc) {
      return (
        <iframe
          src={embedSrc}
          className="w-full h-full border-0 bg-black"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={title}
          onLoad={() => setIsReady(true)}
        />
      );
    }

    if (videoSource === 'direct' && finalSrc) {
      return (
        <video
          ref={playerRef}
          src={finalSrc}
          controls={false}
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          autoPlay={autoplay}
          muted={isMuted}
          playsInline={playsInline}
          poster={poster}
          preload="metadata"
          className={cn(
            "w-full h-full bg-black transition-all duration-300",
            isVerticalVideo ? "object-cover" : "object-contain"
          )}
          onCanPlay={(e: any) => {
            setIsReady(true);
            setError(null);
            if (autoplay || isPlaying) {
              e.target.play().catch((err: any) => {
                if (err?.name !== 'AbortError') {
                  console.log('Autoplay requires user interaction fallback:', err);
                }
              });
            }
          }}
          onLoadedMetadata={(e: any) => {
            setIsReady(true);
            const w = e.target.videoWidth;
            const h = e.target.videoHeight;
            if (h && w) {
              const isVert = h > w;
              setIsVerticalVideo(isVert);
              if (onAspectRatioDetect) {
                onAspectRatioDetect(isVert, isVert ? '9/16' : '16/9');
              }
            }
            if (e.target.duration) setDuration(e.target.duration);
            if (autoplay || isPlaying) {
              e.target.play().catch(() => {});
            }
          }}
          onTimeUpdate={(e: any) => {
            if (e.target.duration > 0) {
              handleProgress(e.target.currentTime / e.target.duration);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onComplete) onComplete();
          }}
          onError={() => {
            setIsReady(true);
            if (isGdrive && !useGdriveFallback) {
              setUseGdriveFallback(true);
            }
          }}
        />
      );
    }

    const playerProps: any = {
      ref: playerRef,
      url: finalSrc,
      playing: isPlaying,
      muted: isMuted,
      volume: volume,
      playbackRate: playbackRate,
      controls: false,
      width: "100%",
      height: "100%",
      playsinline: playsInline,
      loop: loop,
      onReady: () => {
        setIsReady(true);
        setError(null);
      },
      onProgress: (state: any) => handleProgress(state.played),
      onDuration: (d: number) => setDuration(d),
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onEnded: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      config: {
        file: {
          attributes: {
            controlsList: 'nodownload',
            onContextMenu: (e: any) => e.preventDefault(),
            poster: poster,
          }
        },
        youtube: {
          playerVars: {
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: 0,
            autoplay: autoplay ? 1 : 0,
          }
        }
      }
    };

    return (
      <ReactPlayer {...playerProps} />
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden group select-none transition-all duration-300",
        className
      )}
      onClick={resetHideTimer}
      tabIndex={0}
      role="application"
      aria-label={`Video player for ${title}`}
    >
      {/* Loading Shimmer Skeleton */}
      {!isReady && (
        <div className="absolute inset-0 z-40 bg-[#050a06]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mb-4" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1 font-plus-jakarta">Initializing Video Player...</h3>
          <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest">Optimizing Reel playback for phone screen...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
          <p className="text-neutral-400 max-w-xs mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Main Video Element Container */}
      <div className="w-full h-full flex items-center justify-center relative">
        {renderPlayer()}
      </div>

      {/* Tap Listener Background Overlay */}
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={() => {
          if (!showControls) {
            setShowControls(true);
            resetHideTimer();
          } else {
            handleTogglePlay();
          }
        }}
      />

      {/* Top Vignette Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-30" />

      {/* Center Quick Action Controls (Play/Pause, -10s, +10s overlay) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
          >
            <div
              className="flex items-center gap-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rewind 10s */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip(-10);
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                aria-label="Rewind 10 seconds"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Center Play/Pause Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.5)] cursor-pointer"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                ) : (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                )}
              </button>

              {/* Forward 10s */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip(10);
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                aria-label="Forward 10 seconds"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Glassmorphic Control Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 sm:bottom-0 left-2.5 right-2.5 sm:left-0 sm:right-0 z-50 p-1.5 sm:p-5 pb-2 sm:pb-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-[#060c08]/95 border border-white/15 backdrop-blur-2xl p-2.5 sm:p-4 rounded-2xl space-y-2 sm:space-y-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">

              {/* Timeline Progress Bar + Time Readout */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-white/70 min-w-[36px] sm:min-w-[38px] text-right">
                  {formatTime(played * duration)}
                </span>

                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    handleSeek(clickX / rect.width);
                  }}
                  className="flex-1 h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative group/bar transition-all flex items-center"
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full relative shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, played * 100))}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-emerald-500 rounded-full shadow-lg scale-100 transition-transform" />
                  </div>
                </div>

                <span className="text-[10px] sm:text-xs font-mono font-bold text-white/70 min-w-[36px] sm:min-w-[38px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between">
                {/* Left Controls Group */}
                <div className="flex items-center gap-1.5 sm:gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={handleTogglePlay}
                    className="p-1.5 text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    )}
                  </button>

                  {/* Rewind -10s */}
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    aria-label="Rewind 10 seconds"
                  >
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-[10px] font-mono">-10s</span>
                  </button>

                  {/* Forward +10s */}
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    aria-label="Forward 10 seconds"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-[10px] font-mono">+10s</span>
                  </button>

                  {/* Volume Controller */}
                  <div className="flex items-center gap-1.5 sm:gap-2 group/vol">
                    <button
                      onClick={() => setIsMuted(prev => !prev)}
                      className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        if (v > 0) setIsMuted(false);
                      }}
                      className="w-10 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Right Controls Group */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(prev => !prev)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] sm:text-xs font-mono font-bold text-white transition-all cursor-pointer"
                    >
                      {playbackRate}x
                    </button>
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 w-28 bg-neutral-950/95 border border-white/15 rounded-xl overflow-hidden shadow-2xl z-50">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                          <button
                            key={speed}
                            onClick={() => {
                              setPlaybackRate(speed);
                              setShowSettings(false);
                              if (enableHaptics) triggerHaptic('light');
                            }}
                            className={cn(
                              "w-full px-3 py-1.5 text-left text-xs font-mono font-bold transition-colors hover:bg-white/10 cursor-pointer",
                              playbackRate === speed ? "text-emerald-400 bg-white/10" : "text-white/70"
                            )}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
                    aria-label="Toggle Fullscreen"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl z-10 shadow-inner" />
    </div>
  );
}));

UnifiedVideoPlayer.displayName = 'UnifiedVideoPlayer';

export default UnifiedVideoPlayer;

