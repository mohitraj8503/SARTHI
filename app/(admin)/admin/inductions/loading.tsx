import { Zap, ShieldCheck, TrendingUp } from 'lucide-react';

export default function AdminInductionLoading() {
  return (
    <div className="p-8 max-w-screen-2xl mx-auto space-y-12 animate-pulse">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16">
        <div className="space-y-3">
            <div className="w-48 h-6 bg-slate-100 rounded-full" />
            <div className="w-64 h-12 bg-slate-200 rounded-2xl" />
            <div className="w-96 h-4 bg-slate-100 rounded-full" />
        </div>
        
        <div className="w-64 h-24 bg-white border border-[#E2E8F4] rounded-[24px]" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[1, 2].map(i => (
          <div key={i} className="bg-white border border-[#E2E8F4] rounded-[48px] p-12 h-[500px]" />
        ))}
      </div>

      <section className="bg-[#1C2B4A]/10 rounded-[60px] p-24 h-[600px] border border-[#1C2B4A]/5" />
    </div>
  );
}

