import React from 'react';

export function EnergyLevel({ level }: { level: number }) {
  // Level is 0-100
  const ticks = 20;
  const filledTicks = Math.round((level / 100) * ticks);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase tracking-wider">
        <span>Energy</span>
        <span
          className={
            level > 80 ? 'text-emerald-400' : level > 40 ? 'text-yellow-400' : 'text-red-400'
          }
        >
          {level}%
        </span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        {Array.from({ length: ticks }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${
              i < filledTicks
                ? level > 80
                  ? 'bg-emerald-500'
                  : level > 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

