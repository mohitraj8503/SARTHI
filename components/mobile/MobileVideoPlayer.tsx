'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, RotateCw, Maximize, Settings, Volume2, SkipForward, SkipBack } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileVideoPlayerProps {
  url: string;
  title: string;
  onComplete?: () => void;
}

export default function MobileVideoPlayer({ url, title, onComplete }: MobileVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          if (err.name !== 'AbortError') console.error('[MobileVideoPlayer] play() error:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
    resetControlsTimer();
  };

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [resetControlsTimer]);

  return (
    <div 
      className="relative w-full aspect-video bg-black overflow-hidden"
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full"
        autoPlay
        playsInline
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setProgress((v.currentTime / v.duration) * 100);
        }}
        onEnded={onComplete}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <span className="text-white text-xs font-bold truncate max-w-[70%]">{title}</span>
              <button className="p-2 bg-white/10 rounded-full">
                <Settings size={18} color="white" />
              </button>
            </div>

            {/* Center Controls */}
            <div className="flex items-center justify-center gap-12">
              <button onClick={() => skip(-10)} className="p-2">
                <RotateCcw size={32} color="white" />
              </button>
              <button onClick={togglePlay} className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                {isPlaying ? <Pause size={32} color="white" fill="white" /> : <Play size={32} color="white" fill="white" className="ml-1" />}
              </button>
              <button onClick={() => skip(10)} className="p-2">
                <RotateCw size={32} color="white" />
              </button>
            </div>

            {/* Bottom Bar */}
            <div className="space-y-2">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-orange transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/80 font-bold uppercase tracking-widest">
                <span>04:20 / 12:00</span>
                <button onClick={() => videoRef.current?.requestFullscreen()}>
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Tap Overlays (Simulated) */}
      <div 
        className="absolute inset-y-0 left-0 w-1/4" 
        onDoubleClick={() => skip(-10)}
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/4" 
        onDoubleClick={() => skip(10)}
      />
    </div>
  )
}

