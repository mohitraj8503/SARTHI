import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCFA] dark:bg-[#030712] p-6 overflow-hidden">
      <h1 className="sr-only">Loading Page</h1>
      {/* Subtle brand radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(26,60,46,0.04)_0%,_transparent_70%)]" />

      <div className="relative flex flex-col items-center gap-10 text-[#1A3C2E]">
        {/* Spinner rings */}
        <div className="relative w-24 h-24">
          {/* Outer pulse ring */}
          <div className="absolute -inset-3 border border-[#1A3C2E]/8 rounded-full animate-ping" />

          {/* Static orbit ring */}
          <div className="absolute inset-0 border border-[#1A3C2E]/10 rounded-full" />

          {/* Rotating arc — consistent 1.5s timing */}
          <div className="absolute inset-0 border-y-2 border-r-2 border-[#1A3C2E] rounded-full animate-spin" style={{ animationDuration: '1.5s', animationTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }} />

          {/* Brand core */}
          <div className="absolute inset-2 bg-white rounded-full shadow-lg flex items-center justify-center border border-[#F5F0E8]">
            <div className="flex flex-col items-center gap-1">
              <Image src="/sarthi-logo.png" alt="SARTHI" width={48} height={48} className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>

        {/* Status label */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#1A3C2E]/20" />
            {/* font-medium at 11px — readable, not brash */}
            <p className="text-[11px] font-medium text-[#1A3C2E]/50 uppercase tracking-[0.35em] leading-none">
              Loading
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#1A3C2E]/20" />
          </div>

          {/* Consistent 0.15s stagger across dots */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-[#1A3C2E]/70 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

