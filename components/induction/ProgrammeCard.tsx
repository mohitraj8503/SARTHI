import Link from 'next/link';
import { Clock, Users, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Programme {
  id: string | number;
  title: string;
  duration: string;
  mentor: string;
  seats: number;
  level: string;
}

export default function ProgrammeCard({ programme: p, index }: { programme: Programme, index?: number }) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index ? index * 0.05 : 0 }}
        className="group relative h-full"
    >
        <div className="bg-white border border-[#E8E2D9] rounded-[28px] p-8 md:p-10 flex flex-col gap-8 hover:shadow-[0_20px_50px_rgba(26,60,46,0.06)] hover:-translate-y-[6px] transition-all duration-500 h-full">
            <div className="flex justify-between items-start">
                <div className="px-4 py-1.5 rounded-full bg-[#2D6A4F]/5 border border-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-black uppercase tracking-[3px]">
                    {p.level} TRACK
                </div>
                <div className="bg-[#E8B84B]/10 text-[#E8B84B] px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[2px] border border-[#E8B84B]/20">
                    100% Free
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[22px] md:text-[24px] font-black text-[#1A3C2E] leading-[1.1] min-h-[64px] tracking-tighter group-hover:text-[#2D6A4F] transition-colors">
                    {p.title}
                </h3>
                <div className="h-0.5 w-12 bg-[#2D6A4F]/20 group-hover:w-20 transition-all duration-500 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-y-6">
                 <div className="flex items-center gap-3 text-[#1A3C2E] text-[11px] font-bold uppercase tracking-[1px]">
                    <Clock className="w-4 h-4 text-[#2D6A4F]" /> {p.duration}
                 </div>
                 <div className="flex items-center gap-3 text-[#1A3C2E] text-[11px] font-bold uppercase tracking-[1px]">
                    <Users className="w-4 h-4 text-[#2D6A4F]" /> {p.seats} OPENINGS
                 </div>
                 <div className="flex items-center gap-3 text-[#1A3C2E] text-[11px] font-black uppercase tracking-[1.5px] col-span-2 bg-[#F5F0E8]/80 p-4 rounded-2xl border border-[#E8E2D9]">
                    <Award className="w-4 h-4 text-[#2D6A4F]" /> Mentor: {p.mentor}
                 </div>
            </div>

            <div className="mt-auto pt-8 border-t border-[#F5F0E8]">
                <Link href={`#`}>
                    <div className="w-full bg-[#1A3C2E] text-white rounded-[20px] py-4.5 text-[12px] font-black uppercase tracking-[2px] text-center hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-xl shadow-[#1A3C2E]/10">
                        Join Experience Track
                    </div>
                </Link>
                <p className="text-center text-[10px] font-bold text-[#5D705C] mt-4 uppercase tracking-[2px]">Subsidized by SARTHI</p>
            </div>
        </div>
    </motion.div>
  );
}

