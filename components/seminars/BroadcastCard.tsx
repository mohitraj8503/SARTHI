'use client';
 
import { useState, useEffect } from 'react';
import { Play, Zap, Loader2, CheckCircle2, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BroadcastCard({
  startTime,
  seminarId,
  slug,
  isPublic,
  title,
  broadcastUrl,
  thumbnailUrl,
  speakerName,
  duration,
  registrations,
}: {
  startTime: string | null;
  seminarId: string;
  slug?: string;
  isPublic: boolean;
  title: string;
  broadcastUrl: string | null;
  thumbnailUrl?: string | null;
  speakerName?: string;
  duration?: number;
  registrations?: number;
}) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!startTime) return;
    setTimeLeft(calculateTimeLeft(startTime));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(startTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  async function handleRegister() {
    setIsRegistering(true);
    try {
      const res = await fetch('/api/seminars/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seminarId }),
      });

      if (res.status === 401) {
        if (slug) {
          window.location.href = `/seminars/${slug}/register`;
          return;
        } else {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
      }

      const data = await res.json();
      if (res.ok) {
        setIsRegistered(true);
        if (data.eventLink) {
          window.open(data.eventLink, '_blank');
        }
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsRegistering(false);
    }
  }

  const isLive = new Date(startTime || 0).getTime() <= new Date().getTime();

  const formattedDate = startTime
    ? new Date(startTime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'March 27, 2026';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 lg:gap-8">
        {/* Left: Large Thumbnail - Premium Media Card */}
        <div className="relative rounded-[20px] lg:rounded-[24px] overflow-hidden bg-[#1A3C2E] group shadow-lg ring-1 ring-black/[0.08] transform transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5">
          <div className="aspect-[16/10] relative">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for ${title}`}
                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A3C2E] via-[#163828] to-[#0F2A1E] flex items-center justify-center">
                <MonitorPlay className="w-20 h-20 text-white/[0.08]" />
              </div>
            )}

            {/* Cinematic Gradient Overlay - Blends poster into deep green */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A1E] via-[#0F2A1E]/20 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A3C2E]/30 via-transparent to-transparent" />

            {/* Centered Play Button (Premium Glassmorphic) */}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  aria-label="Play seminar teaser"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/[0.12] backdrop-blur-xl border border-white/[0.15] flex items-center justify-center text-white group-hover:scale-105 group-hover:bg-white/[0.18] transition-all duration-500 shadow-2xl shadow-black/20"
                >
                  <Play className="w-6 h-6 lg:w-8 lg:h-8 ml-0.5 fill-white drop-shadow-lg" />
                </button>
              </div>
            )}

            {/* Status Badge (Refined Glassmorphic) */}
            <div className="absolute top-5 left-5 lg:top-6 lg:left-6">
              <div className="px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full bg-black/25 backdrop-blur-xl border border-white/[0.08] text-[9px] lg:text-[10px] font-black text-white/90 uppercase tracking-[0.2em] shadow-lg">
                {isLive ? 'Stream Running' : 'Broadcast Ready'}
              </div>
            </div>

            {/* Seminar Highlights Overlay - Resolves empty lower area */}
            <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
              <div className="flex items-center gap-4 flex-wrap">
                {duration && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.06]">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{duration}m</span>
                  </div>
                )}
                {speakerName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.06]">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider truncate max-w-[120px]">{speakerName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Free Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Embed */}
          {isLive && (
            <div className="absolute inset-0 bg-black z-10">
              <iframe
                src={
                  broadcastUrl?.includes('embed')
                    ? broadcastUrl
                    : `https://www.youtube.com/embed/${broadcastUrl?.split('v=')[1] || broadcastUrl?.split('/').pop()}?modestbranding=1&rel=0`
                }
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Right: Premium Info Panel */}
        <div className="bg-white rounded-[20px] border border-[#E8E2D9] p-5 lg:p-6 shadow-sm ring-1 ring-[#1A3C2E]/[0.04] flex flex-col">
          {/* Speaker */}
          <div className="flex flex-col gap-1.5 pb-4 border-b border-[#E8E2D9]/80">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em]">
              Expert Speaker
            </span>
            <span className="text-[15px] font-black text-[#1A3C2E] tracking-[-0.01em]">
              {speakerName || 'SARTHI'}
            </span>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5 py-4 border-b border-[#E8E2D9]/80">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em]">
              Date Scheduled
            </span>
            <span className="text-[15px] font-black text-[#1A3C2E] tracking-[-0.01em]">{formattedDate}</span>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5 py-4 border-b border-[#E8E2D9]/80">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em]">
              Total Runtime
            </span>
            <span className="text-[15px] font-black text-[#1A3C2E] tracking-[-0.01em]">
              {duration || 60} Minutes
            </span>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5 py-4 border-b border-[#E8E2D9]/80">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em]">
              Status
            </span>
            <span className="text-[12px] font-black text-[#2D6A4F] uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              {isLive ? 'Live Now' : 'Scheduled'}
            </span>
          </div>

          {/* Countdown */}
          <div className="flex flex-col gap-2.5 pt-4 pb-5">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em]">
              Starts In
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] lg:text-[32px] font-black text-[#1A3C2E] tabular-nums tracking-[-0.03em] leading-none">
                {timeLeft.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[9px] lg:text-[10px] font-black text-[#5D705C] uppercase tracking-widest ml-0.5">
                h
              </span>
              <span className="text-[28px] lg:text-[32px] font-black text-[#1A3C2E] tabular-nums tracking-[-0.03em] leading-none ml-2">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[9px] lg:text-[10px] font-black text-[#5D705C] uppercase tracking-widest ml-0.5">
                m
              </span>
              <span className="text-[28px] lg:text-[32px] font-black text-[#1A3C2E] tabular-nums tracking-[-0.03em] leading-none ml-2">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[9px] lg:text-[10px] font-black text-[#5D705C] uppercase tracking-widest ml-0.5">
                s
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleRegister}
            disabled={isRegistering || isRegistered}
            aria-label={isRegistered ? 'Registration confirmed' : 'Register for live access'}
            className={cn(
              'w-full py-3.5 lg:py-4 rounded-[14px] font-black text-[11px] lg:text-[12px] uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-2.5',
              isRegistered
                ? 'bg-[#F5F0E8] text-[#2D6A4F] border border-[#E8E2D9]'
                : 'bg-[#1A3C2E] text-white shadow-md hover:bg-[#2D6A4F] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-4 focus:ring-[#2D6A4F]/15 focus:outline-none'
            )}
          >
            {isRegistering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegistered ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-white" />
            )}
            {isRegistering ? 'Processing' : isRegistered ? 'Confirmed' : 'Register Now'}
          </button>

          {/* Seats Info */}
          <p className="text-center text-[10px] text-[#5D705C] font-medium mt-3 tracking-wide">
            {registrations || 42} seats filled · Free access
          </p>
        </div>
      </div>

      {/* Minimal Footer Info */}
      <div className="text-center mt-6">
        <p className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.35em]">
          SARTHI Strategic Series · 2026
        </p>
      </div>
    </div>
  );
}

function calculateTimeLeft(targetDate: string | null) {
  if (!targetDate) return { hours: 0, minutes: 0, seconds: 0 };
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

