'use client';

import { useEffect, useState } from 'react';

export function DebugClicks() {
  const [clicks, setClicks] = useState<{x: number, y: number, target: string}[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setClicks(prev => [
        { 
          x: e.clientX, 
          y: e.clientY, 
          target: target.tagName + (target.className ? `.${String(target.className).split(' ')[0]}` : '')
        },
        ...prev.slice(0, 9)
      ]);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs"
      >
        Debug Clicks
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-xl max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-sm">Click Debug</h4>
        <button onClick={() => setIsVisible(false)} className="text-xs text-gray-400">Close</button>
      </div>
      <div className="text-xs space-y-1 max-h-64 overflow-y-auto">
        {clicks.length === 0 ? (
          <p className="text-red-400">No clicks detected! ❌</p>
        ) : (
          clicks.map((click, i) => (
            <div key={i} className="text-green-400">
              ✓ {click.target}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

