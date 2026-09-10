'use client'

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Settings, Maximize, Play, Pause, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
  onProgress?: (percent: number) => void;
}

/**
 * Adaptive HLS Video Player
 * Features secure streaming, auto-save progress, and mobile-optimized quality control.
 */
export function VideoPlayer({ videoId, courseId, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (!videoRef.current || !videoId) return;
    
    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(`/api/courses/${courseId}/lessons/${videoId}/stream`);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Ready to play
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = `/api/courses/${courseId}/lessons/${videoId}/stream`;
    }

    const interval = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        onProgress?.(video.currentTime / video.duration);
      }
    }, 30000);

    return () => {
      if (hls) hls.destroy();
      clearInterval(interval);
    };
  }, [videoId, courseId, onProgress]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('[VideoPlayer] play() error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative group aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
      <video 
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />
      
      {/* Overlay Controls (Mobile-Friendly) */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="text-white hover:text-emerald-400 transition-colors">
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-white hover:text-emerald-400 transition-colors">
              <Settings size={20} />
            </button>
            <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-emerald-400 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
