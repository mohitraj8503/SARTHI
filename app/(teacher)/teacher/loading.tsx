import { Video } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
      <div className="relative w-16 h-16 mb-8 group">
        <div className="absolute inset-0 border-[3px] border-[#1A3C2E]/5 border-t-[#1A3C2E] rounded-[24px] animate-spin" />
        <Video className="absolute inset-0 m-auto w-6 h-6 text-[#1A3C2E]/20" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-[11px] font-black text-[#1A3C2E] uppercase tracking-[0.3em] animate-pulse">
          Initializing_Studio...
        </h2>
        <p className="text-[9px] font-bold text-[#5D705C] uppercase tracking-widest opacity-40 italic">Preparing instruction directives</p>
      </div>
    </div>
  );
}

