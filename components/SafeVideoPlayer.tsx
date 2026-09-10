'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Settings, 
  AlertCircle, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafeVideoPlayerProps {
  videoId: string;
  title?: string;
  initialTime?: number;
  autoPlay?: boolean;
  onProgress?: (time: number, duration: number) => void;
  onComplete?: () => void;
  onReady?: (player: any) => void;
}

export interface SafeVideoPlayerRef {
  getCurrentTime: () => number;
  pause: () => void;
  play: () => void;
  seekTo: (time: number) => void;
}

const SafeVideoPlayer = forwardRef<SafeVideoPlayerRef, SafeVideoPlayerProps>((
  {
    videoId,
    title,
    initialTime = 0,
    autoPlay = false,
    onProgress,
    onComplete,
    onReady,
  },
  ref
) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => player?.getCurrentTime() || 0,
    pause: () => player?.pauseVideo(),
    play: () => player?.playVideo(),
    seekTo: (time: number) => player?.seekTo(time),
  }));

  // Video Options
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: autoPlay ? 1 : 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      start: Math.floor(initialTime),
      fs: 0, 
      iv_load_policy: 3, 
      disablekb: 1, 
    },
  };

  const handleReady = (event: any) => {
    setPlayer(event.target);
    setIsReady(true);
    setDuration(event.target.getDuration());
    if (initialTime > 0) {
      event.target.seekTo(initialTime);
    }
    if (onReady) onReady(event);
  };

  const handleError = (e: any) => {
    console.error("Video Player Error:", e);
    setHasError(true);
  };

  const handleStateChange = (event: any) => {
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
    if (event.data === 0) {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  // Progress Tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && player) {
      interval = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        if (onProgress) onProgress(time, player.getDuration());
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, player, onProgress]);

  const togglePlay = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying, player]);

  const seek = useCallback((seconds: number) => {
    if (!player) return;
    const current = player.getCurrentTime();
    const dur = player.getDuration();
    const newTime = Math.min(Math.max(current + seconds, 0), dur);
    player.seekTo(newTime);
    setCurrentTime(newTime);
  }, [player]);

  const changeRate = (rate: number) => {
    if (!player) return;
    player.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings) setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
       switch(e.key.toLowerCase()) {
         case ' ': case 'k': e.preventDefault(); togglePlay(); break;
         case 'arrowright': seek(10); break;
         case 'arrowleft': seek(-10); break;
         case 'f': toggleFullscreen(); break;
         case 'm': 
            if(player) {
              if(isMuted) { player.unMute(); setIsMuted(false); } 
              else { player.mute(); setIsMuted(true); }
            }
            break;
       }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, isMuted, player, seek, toggleFullscreen]);


  if (hasError) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-900 flex flex-col items-center justify-center text-white p-8 rounded-[14px] shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          We couldn&apos;t load this lesson. It might be restricted or deleted.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.35)]'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900">
           <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Lesson...</p>
           </div>
        </div>
      )}

      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onError={handleError}
        onStateChange={handleStateChange}
        className="w-full h-full pointer-events-none select-none"
        iframeClassName="w-full h-full"
      />

      <AnimatePresence>
        {(showControls || !isPlaying) && isReady && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent pt-20 pb-4 px-6"
          >
            {title && (
              <div className="absolute top-6 left-6 text-white text-lg font-bold drop-shadow-md tracking-tight">
                {title}
              </div>
            )}

            <div className="w-full mb-5 group/timeline relative h-2 flex items-end">
               <input 
                 type="range" 
                 min={0} 
                 max={duration} 
                 value={currentTime} 
                 onChange={(e) => {
                   const val = Number(e.target.value);
                   setCurrentTime(val);
                   player.seekTo(val);
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
               />
               
               <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative group-hover/timeline:h-2 transition-all duration-200">
                  <div 
                    className="absolute top-0 left-0 h-full bg-brand-orange rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/10 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100 + 15}%` }}
                  />
               </div>

               <div 
                  className="absolute bottom-0 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
               />
            </div>

            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-brand-orange transition-transform hover:scale-110"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>

                <div className="flex items-center gap-4 group/vol">
                  <div className="flex items-center gap-2">
                     <button onClick={() => {
                        if(player) {
                           if(isMuted) { player.unMute(); setIsMuted(false); } 
                           else { player.mute(); setIsMuted(true); }
                        }
                     }} className="text-white hover:text-brand-orange">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                     </button>
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => {
                           const vol = Number(e.target.value);
                           setVolume(vol);
                           player.setVolume(vol);
                           if(vol > 0 && isMuted) { setIsMuted(false); player.unMute(); }
                        }}
                        className="w-0 overflow-hidden group-hover/vol:w-20 transition-all h-1 bg-white/50 rounded-lg accent-white appearance-none cursor-pointer" 
                     />
                  </div>
                  <div className="text-white text-xs font-mono font-medium opacity-80 select-none">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative">
                <button onClick={() => seek(-10)} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all" title="Rewind 10s">
                   <RotateCcw className="w-5 h-5" />
                </button>
                <button onClick={() => seek(10)} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all" title="Forward 10s">
                   <FastForward className="w-5 h-5" />
                </button>

                <div className="relative">
                   <button 
                     onClick={() => setShowSettings(!showSettings)}
                     className={`p-2 rounded-full transition-all ${showSettings ? 'text-brand-orange bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                   >
                     <Settings className={`w-5 h-5 transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`} />
                   </button>
                   
                   <AnimatePresence>
                     {showSettings && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="absolute bottom-full right-0 mb-3 bg-[#111] border border-white/10 rounded-xl p-4 min-w-[200px] shadow-xl backdrop-blur-xl"
                       >
                          <div className="space-y-4">
                             <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Speed</h4>
                                <div className="grid grid-cols-3 gap-2">
                                   {[0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                      <button 
                                        key={rate}
                                        onClick={() => changeRate(rate)}
                                        className={`text-xs font-bold py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors ${playbackRate === rate ? 'bg-brand-orange text-white border-brand-orange' : 'text-gray-400'}`}
                                      >
                                        {rate}x
                                      </button>
                                   ))}
                                </div>
                             </div>

                             <div className="pt-3 border-t border-white/10 space-y-2">
                                <label className="flex items-center justify-between text-xs text-gray-300 font-medium cursor-pointer">
                                   <span>Auto-play next</span>
                                   <div className="w-8 h-4 bg-brand-orange/20 rounded-full relative"><div className="w-2 h-2 bg-brand-orange rounded-full absolute top-1 right-1" /></div>
                                </label>
                             </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <button onClick={toggleFullscreen} className="text-white hover:text-brand-orange p-2 hover:bg-white/10 rounded-full transition-all">
                   {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && isReady && !showControls && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
           <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl group cursor-pointer pointer-events-auto" onClick={togglePlay}>
              <Play className="w-8 h-8 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
           </div>
        </motion.div>
      )}
    </div>
  );
});

SafeVideoPlayer.displayName = 'SafeVideoPlayer';

export default SafeVideoPlayer;

