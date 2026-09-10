import React from 'react';
import { Atom } from 'lucide-react';

export function QuantumBadge({ level }: { level: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-[10px] font-black uppercase tracking-widest">
      <Atom className="w-3.5 h-3.5" />
      Quantum Lvl {level}
    </div>
  );
}

