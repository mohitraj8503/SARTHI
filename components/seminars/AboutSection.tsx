import { BookOpen, Clock, Users, Zap } from 'lucide-react';

export function AboutSection({ description }: { description: string | null }) {
  return (
    <div className="bg-white rounded-[48px] p-12 md:p-16 border border-[#E8E2D9] shadow-soft">
      <div className="max-w-3xl">
        <div className="flex items-start gap-8 mb-12">
          <div className="w-16 h-16 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-3xl border border-[#2D6A4F]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="pt-2">
            <h3 className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-[0.4em] mb-3 leading-none underline underline-offset-[6px] decoration-[#2D6A4F]/20">
              Curated Perspective
            </h3>
            <h2 className="text-4xl font-black text-[#1A3C2E] tracking-tight leading-tight">
              Strategy and implementation <br/> insights for specialists
            </h2>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-[#1A3C2E]/80 leading-[1.6] text-2xl font-medium space-y-12">
            <p>
              {description || "Join us for an immersive technical session where we'll explore deep architectural patterns and implementation strategies. This session is engineered to deliver high-priority insights for strategic growth and operational excellence."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-16 border-t border-[#E8E2D9] grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-[24px] bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500/10 transition-colors">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.2em] mb-1.5 leading-none">Min. Duration</p>
            <p className="text-lg font-black text-[#1A3C2E]">60 Minutes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-[24px] bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-500/10 transition-colors">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.2em] mb-1.5 leading-none">Focus Group</p>
            <p className="text-lg font-black text-[#1A3C2E]">Tech Savvy</p>
          </div>
        </div>

        <div className="flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-[24px] bg-[#2D6A4F]/5 border border-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] group-hover:bg-[#2D6A4F]/10 transition-colors">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.2em] mb-1.5 leading-none">Complexity</p>
            <p className="text-lg font-black text-[#1A3C2E]">All Levels</p>
          </div>
        </div>
      </div>
    </div>
  );
}

