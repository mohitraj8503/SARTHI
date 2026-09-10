import React from 'react';
import { Globe } from 'lucide-react';

export function MultiverseRank({ rank }: { rank: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 flex items-center justify-center bg-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Globe className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </div>
      </div>
      <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        #{rank}
      </div>
    </div>
  );
}

