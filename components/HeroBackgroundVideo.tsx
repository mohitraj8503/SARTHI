'use client';

import { useRef, useEffect, useState, memo } from 'react';
import Image from 'next/image';
import { VIDEO_QUALITIES, pickInitialQuality, Quality } from '@/lib/videoQuality';

function HeroBackgroundVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [quality, setQuality] = useState<Quality>('720p');

  // Fast-start mount
  useEffect(() => {
    // Start loading video assets immediately on mount
    setShouldLoad(true);

    const updateQuality = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const isMobileDevice = window.matchMedia('(max-width: 767px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const conn = (navigator as any).connection;

      const initialQuality = pickInitialQuality({
        viewportWidth: width,
        deviceMemory: (navigator as any).deviceMemory || 4,
        effectiveType: conn?.effectiveType || '4g',
        downlink: conn?.downlink || 10,
        saveData: conn?.saveData || false,
        isMobile: isMobileDevice,
      });
      setQuality(initialQuality);
    };

    updateQuality();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.1;
        setIsInView(visible);
      },
      { threshold: [0, 0.1, 0.5], rootMargin: '100px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateQuality, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateQuality);
    };
  }, []);

  // Play/pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isInView) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [shouldLoad, isInView]);

  // requestVideoFrameCallback to capture the precise first frame render and prevent black screen flash
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    let callbackId: number;

    if ('requestVideoFrameCallback' in video) {
      const checkFrame = () => {
        setVideoReady(true);
      };
      callbackId = (video as any).requestVideoFrameCallback(checkFrame);
    } else {
      // Fallback for older browsers
      const handleCanPlay = () => setVideoReady(true);
      video.addEventListener('canplaythrough', handleCanPlay, { passive: true });
      video.addEventListener('playing', handleCanPlay, { passive: true });
      return () => {
        video.removeEventListener('canplaythrough', handleCanPlay);
        video.removeEventListener('playing', handleCanPlay);
      };
    }

    return () => {
      if (video && callbackId && 'cancelVideoFrameCallback' in video) {
        (video as any).cancelVideoFrameCallback(callbackId);
      }
    };
  }, [shouldLoad, quality]);

  const currentVideoUrl = VIDEO_QUALITIES[quality]?.url;

  return (
    <div
      ref={containerRef}
      className="hero-section absolute inset-0 w-full h-full overflow-hidden bg-[#050A14] gpu-accelerated will-change-transform"
    >
      {/* Subtle Breathing Glow Shimmer during loading (usually under 1 second) */}
      {!videoReady && (
        <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-[#16A34A]/5 via-transparent to-transparent animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />
      )}

      {/* POSTER / FALLBACK IMAGE: Fully configured with matching brightness/contrast & subtle blur */}
      <div
        className="absolute inset-0 w-full h-full z-0 transition-opacity ease-out duration-[600ms] will-change-opacity"
        style={{ opacity: videoReady ? 0 : 1 }}
      >
        <Image
          src="/videos/hero-poster.jpg"
          alt="SARTHI Hero"
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="object-cover scale-102"
          style={{ filter: 'brightness(0.82) contrast(1.08) blur(2px)' }}
        />
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
      </div>

      {shouldLoad && currentVideoUrl && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={currentVideoUrl}
          className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity ease-out duration-[600ms] will-change-opacity scale-102"
          style={{
            opacity: videoReady ? 1 : 0,
            visibility: isInView ? 'visible' : 'hidden',
            filter: 'brightness(0.82) contrast(1.08) blur(2px)'
          }}
        />
      )}

      {/* Hero overlays are static and render immediately */}
      <div className="hero-overlay absolute inset-0 z-[2] bg-gradient-to-b from-black/20 via-black/35 to-[#0A1628]/70 pointer-events-none" />
      <div className="absolute inset-0 z-[3] opacity-[0.02] pointer-events-none bg-noise mix-blend-overlay" />
    </div>
  );
}

export default memo(HeroBackgroundVideo);
