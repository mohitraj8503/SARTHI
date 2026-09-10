
'use client';

import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { PlayCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface VideoPlayerProps {
  videoId: string;
  onProgress: (watchedTime: number, totalTime: number, lastPosition: number) => void;
  initialTime?: number;
  thumbnailUrl?: string; // Optional custom thumbnail
}

export default function VideoPlayer({ videoId, onProgress, initialTime = 0, thumbnailUrl }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showFacade, setShowFacade] = useState(true);

  // Optimized player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, // Autoplay when clicked
      start: Math.floor(initialTime),
      playsinline: 1, // iOS mobile optimization
      modestbranding: 1,
      rel: 0, // No related videos
      controls: 1,
    },
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    setIsReady(true);
    setDuration(event.target.getDuration());
    // Reduce TTI by not forcing seek immediately unless needed
    if (initialTime > 0) {
      event.target.seekTo(initialTime);
    }
  };

  const [lastSyncTime, setLastSyncTime] = useState(0);

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) { // playing
      setIsPlaying(true);
      const interval = setInterval(() => {
        if (playerRef.current) {
          const current = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();

          setCurrentTime(current);
          setDuration(dur);

          // Call parent onProgress callback
          onProgress(current, dur, current);
        }
      }, 1000); // 1s interval is sufficient for progress
      (playerRef.current as any)._progressInterval = interval;
    } else {
      setIsPlaying(false);
      if (playerRef.current && (playerRef.current as any)._progressInterval) {
        clearInterval((playerRef.current as any)._progressInterval);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current && (playerRef.current as any)._progressInterval) {
        clearInterval((playerRef.current as any)._progressInterval);
      }
    };
  }, []);

  // Use high-quality thumbnail if not provided
  const poster = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="w-full max-w-4xl mx-auto gpu-accelerated contain-paint">
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
        style={{ paddingBottom: '56.25%' }} // 16:9 Aspect Ratio
      >
        <AnimatePresence mode="wait">
          {showFacade ? (
            <motion.div
              key="facade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 cursor-pointer group"
              onClick={() => setShowFacade(false)}
            >
              {/* Lazy load thumbnail */}
              <Image
                src={poster}
                alt="Video thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority={true}
              />

              {/* Optimised Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-[2px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-xl">
                  <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white/20" />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0">
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
                  <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
                </div>
              )}
              <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                className="absolute top-0 left-0 w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress & Stats Bar */}
      <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-600 font-medium px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span>
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            <span className="mx-1 text-gray-400">/</span>
            {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
        {duration > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-orange transition-all duration-300 ease-out"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span>{Math.round((currentTime / duration) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

