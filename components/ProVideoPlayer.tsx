'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  AlertCircle,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface ProVideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface ProVideoPlayerProps {
  videoId: string;
  title?: string;
  initialTime?: number;
  autoPlay?: boolean;
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onComplete?: () => void;
  onDuration?: (duration: number) => void;
  className?: string;
}

const ProVideoPlayer = forwardRef<ProVideoPlayerRef, ProVideoPlayerProps>(({
  videoId,
  title,
  initialTime = 0,
  autoPlay = false,
  onProgress,
  onComplete,
  onDuration,
  className = ''
}, ref) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // Facade state - if autoplay is false, we start with facade
  const [showFacade, setShowFacade] = useState(!autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Format time (mm:ss or hh:mm:ss)
  const formatTime = useCallback((seconds: number) => {
    if (!seconds && seconds !== 0) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, []);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => currentTime,
    getDuration: () => duration,
    seekTo: (time: number) => {
      if (player) {
        player.seekTo(time, true);
        setCurrentTime(time);
      }
    },
    play: () => {
      if (showFacade) setShowFacade(false);
      player?.playVideo()
    },
    pause: () => player?.pauseVideo(),
  }));

  // Setup Player Options
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, // Always autoplay once facade is removed
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      start: initialTime,
      fs: 0,
      disablekb: 1,
      playsinline: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  };

  // Event Handlers
  const onPlayerReady = useCallback((event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setIsReady(true);
    setIsLoading(false);

    const dur = playerInstance.getDuration();
    setDuration(dur);
    if (onDuration) onDuration(dur);

    try {
      if (playerInstance.getVolume) {
        const initialVolume = playerInstance.getVolume();
        const initialMuted = playerInstance.isMuted();
        setVolume(initialVolume);
        setIsMuted(initialMuted);
      }
    } catch {
      console.warn('Could not get initial volume state');
    }

    if (initialTime > 0) {
      playerInstance.seekTo(initialTime, true);
      setCurrentTime(initialTime);
    }
  }, [initialTime, onDuration]);

  const onPlayerStateChange = useCallback((event: any) => {
    const state = event.data;

    if (state === 1) { // Playing
      setIsPlaying(true);
      setIsLoading(false);
    } else if (state === 2) { // Paused
      setIsPlaying(false);
    } else if (state === 3) { // Buffering
      setIsLoading(true);
    } else if (state === 0) { // Ended
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  }, [onComplete]);

  const onPlayerError = useCallback((e: any) => {
    console.error("YouTube Player Error:", e.data);
    setHasError(true);
    setIsLoading(false);
  }, []);

  // Mounted tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Progress Tracking
  useEffect(() => {
    if (isPlaying && !isSeeking && player) {
      progressInterval.current = setInterval(() => {
        if (!isMountedRef.current) return;

        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration();
          const loaded = player.getVideoLoadedFraction();

          if (time !== currentTime) setCurrentTime(time);
          if (dur !== duration) setDuration(dur);
          setBuffered(loaded * 100);

          if (onProgress) {
            onProgress({
              played: dur > 0 ? time / dur : 0,
              playedSeconds: time,
              loaded: loaded,
              loadedSeconds: loaded * dur
            });
          }
        } catch {
          // ignore
        }
      }, 200);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying, isSeeking, player, onProgress, currentTime, duration]);

  // Controls Visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);

    if (isPlaying && !showSettings) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, showSettings]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    } else {
      showControlsTemporarily();
    }
  }, [isPlaying, showControlsTemporarily]);

  // Interactions
  const togglePlay = useCallback(() => {
    if (showFacade) {
      setShowFacade(false);
      return;
    }
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying, player, showFacade]);

  const skip = useCallback((seconds: number) => {
    if (!player || !duration) return;
    const current = player.getCurrentTime();
    const newTime = Math.min(Math.max(current + seconds, 0), duration);
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
    showControlsTemporarily();
  }, [player, duration, showControlsTemporarily]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (player) {
      player.seekTo(time, true);
    }
  }, [player]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [player, duration]);

  const toggleMute = useCallback(() => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
      const vol = player.getVolume();
      setVolume(vol > 0 ? vol : 50);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, [player, isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (player) {
      player.setVolume(vol);
      if (vol > 0 && isMuted) {
        player.unMute();
        setIsMuted(false);
      } else if (vol === 0 && !isMuted) {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [player, isMuted]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (player) {
      player.setPlaybackRate(rate);
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  }, [player]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Close settings on outside click
  useEffect(() => {
    if (!showSettings) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSettings]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleFullscreen, toggleMute]);

  if (hasError) {
    return (
      <div className={`w-full h-full min-h-[400px] bg-[#050505] flex flex-col items-center justify-center text-white p-8 border border-white/5 rounded-2xl ${className}`}>
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-black mb-2 tracking-tight">Stream Unavailable</h3>
        <p className="text-gray-400 mb-8 text-center max-w-sm text-sm font-medium">
          The video stream encountered a connection error or has been restricted.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-colors"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`gpu-accelerated relative w-full h-full bg-black group overflow-hidden select-none ${isFullscreen ? 'rounded-none' : 'rounded-2xl'} ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {(isLoading && !showFacade) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facade Overlay (High Performance) */}
      <AnimatePresence>
        {showFacade && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 cursor-pointer group/facade"
            onClick={() => setShowFacade(false)}
          >
            {/* Thumbnail */}
            <Image
              src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video Thumbnail"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20 group-hover/facade:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 bg-white/10 hover:bg-brand-orange backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 shadow-2xl group-hover/facade:scale-110">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Play Overlay (Big Button) - Only show if facade is gone but user paused */}
      {!showFacade && !isPlaying && isReady && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20" onClick={togglePlay}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 bg-white/10 hover:bg-brand-orange backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 transition-colors cursor-pointer shadow-2xl"
          >
            <Play className="w-8 h-8 text-white fill-current ml-1" />
          </motion.div>
        </div>
      )}

      {/* The Actual Video Player - Only render/load when facade is gone */}
      {!showFacade && (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
          className="w-full h-full pointer-events-none"
          iframeClassName="w-full h-full object-cover"
        />
      )}

      {/* Custom Controls */}
      <AnimatePresence>
        {isReady && !showFacade && (showControls || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-20"
          >
            {/* Info Header */}
            {title && (
              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
                <h3 className="text-white font-bold text-shadow-md truncate pr-16 text-lg tracking-tight">{title}</h3>
              </div>
            )}

            <div className="px-6 pb-6 space-y-4">

              {/* Progress Bar */}
              <div
                className="group/progress relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all duration-300"
                onClick={handleProgressBarClick}
              >
                {/* Loaded Buffer Bar */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full pointer-events-none"
                  style={{ width: `${buffered}%` }}
                />

                {/* Play Progress Bar */}
                <div
                  className="absolute top-0 left-0 h-full bg-brand-orange rounded-full pointer-events-none shadow-[0_0_10px_rgba(255,106,0,0.5)]"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform" />
                </div>

                {/* Range Input (Invisible Touch Target) */}
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="any"
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={handleSeekStart}
                  onMouseUp={handleSeekEnd}
                  onTouchStart={handleSeekStart}
                  onTouchEnd={handleSeekEnd}
                  aria-label="Video progress"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-3 md:gap-6">
                  <button
                    onClick={togglePlay}
                    className="p-2 text-white hover:text-brand-orange transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" /> : <Play className="w-6 h-6 md:w-7 md:h-7 fill-current" />}
                  </button>

                  <div className="group/volume flex items-center gap-2 md:gap-3">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:text-gray-300"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                    <div className="hidden md:block w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        className="w-20 h-1 accent-white bg-white/30 rounded-full cursor-pointer"
                      />
                    </div>
                  </div>

                  <span className="text-[10px] md:text-xs font-mono font-medium text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1 md:gap-4">
                  <button
                    onClick={() => skip(-10)}
                    className="p-2 text-white/70 hover:text-white transition-colors hidden sm:block"
                    aria-label="Skip back 10 seconds"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => skip(10)}
                    className="p-2 text-white/70 hover:text-white transition-colors hidden sm:block"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Settings Menu */}
                  <div className="relative" ref={settingsRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                      className={`p-2 transition-transform duration-300 ${showSettings ? 'rotate-90 text-white' : 'text-white/70 hover:text-white'}`}
                      aria-label="Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-4 w-40 bg-[#0a0a0a]/95 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl p-2 z-50"
                        >
                          <div className="text-[10px] uppercase font-black text-gray-500 px-3 py-2">Playback Speed</div>
                          <div className="space-y-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => changePlaybackRate(rate)}
                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${playbackRate === rate ? 'bg-brand-orange text-white' : 'text-gray-300 hover:bg-white/10'
                                  }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:text-white transition-colors"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ProVideoPlayer.displayName = 'ProVideoPlayer';

export default ProVideoPlayer;

