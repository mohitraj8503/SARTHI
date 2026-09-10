'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Loader2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  priority?: boolean;
}

export default function YouTubePlayer({
  videoId,
  title = 'YouTube video player',
  className = '',
  priority = false,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlay = async () => {
    setIsLoading(true);
    // Preload iframe for smoother experience
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Small delay for better UX
    setTimeout(() => {
      setIsPlaying(true);
      setIsLoading(false);
      document.body.removeChild(iframe);
    }, 200);
  };

  if (isPlaying) {
    return (
      <div
        className={`relative w-full pb-[56.25%] overflow-hidden rounded-xl bg-black will-change-transform ${className}`}
        style={{ contain: 'layout style paint' }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
          loading="lazy"
          style={{ willChange: 'transform' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full pb-[56.25%] overflow-hidden rounded-xl bg-gray-900 cursor-pointer group will-change-transform ${className}`}
      onClick={handlePlay}
      style={{ contain: 'layout style paint' }}
    >
      {isInView && (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          style={{ willChange: 'opacity' }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 will-change-transform">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
        Tap to Play
      </div>
    </div>
  );
}

export function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

