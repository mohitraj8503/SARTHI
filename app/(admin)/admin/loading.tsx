import { Cpu } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
      <div className="relative w-20 h-20 mb-10">
        <div className="absolute inset-0 border-4 border-[#1C2B4A]/5 border-t-[#1C2B4A] rounded-full animate-spin shadow-inner" />
        <div className="absolute inset-4 border-2 border-[#1C2B4A]/10 border-b-[#1C2B4A] rounded-full animate-spin-slow" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-[10px] font-black text-[#1C2B4A] uppercase tracking-[0.4em] animate-pulse italic">
          Synchronizing...
        </h2>
        <div className="flex items-center gap-2 text-[9px] font-bold text-[#1C2B4A]/30 uppercase tracking-[0.2em] italic">
          <Cpu className="w-3.5 h-3.5" />
          <span>Core_Subsystems_Active</span>
        </div>
      </div>
    </div>
  );
}

