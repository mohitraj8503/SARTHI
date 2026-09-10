import { CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export function AccessInfo({ isPublic }: { isPublic: boolean }) {
  return (
    <div className="bg-white rounded-[48px] p-12 border border-[#E8E2D9] shadow-soft relative overflow-hidden group">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2D6A4F]/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-[#2D6A4F]/10 transition-colors duration-1000" />
      <Sparkles className="absolute top-8 right-8 w-16 h-16 text-[#2D6A4F]/10 -rotate-12 group-hover:rotate-12 transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-[24px] bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 flex items-center justify-center mb-10 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-[#2D6A4F]" />
        </div>
        
        <h4 className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-[0.4em] mb-4 leading-none">
          Verified Status
        </h4>
        <h3 className="text-3xl font-black text-[#1A3C2E] mb-6 tracking-tight leading-tight">
          {isPublic ? 'Unrestricted strategy access' : 'Reserved executive entry'}
        </h3>
        
        <p className="text-sm text-[#5D705C] leading-relaxed font-bold mb-12 max-w-[240px]">
          All SARTHI seminars are engineered for high-impact learners and industry strategists.
        </p>
        
        <div className="space-y-6">
          {[
            { label: 'Zero Cost Forever', icon: <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" /> },
            { label: 'Lifetime Learning', icon: <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" /> },
            { label: 'Certified Credits', icon: <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" /> }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-5 group/item">
              <div className="w-6 h-6 rounded-full border border-[#E8E2D9] flex items-center justify-center bg-[#FDFCFB] group-hover/item:border-[#2D6A4F] transition-colors">
                {item.icon}
              </div>
              <span className="text-[11px] font-black text-[#1A3C2E] uppercase tracking-[0.2em]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

