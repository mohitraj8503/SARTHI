import { motion } from 'framer-motion';
import { Calendar, Video, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function SeminarHighlight() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#1A3C2E] overflow-hidden">

      {/* Background Accents */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#E8B84B]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2D6A4F]/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#F5F0E8 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto px-6 max-w-screen-xl relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B] text-[11px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B84B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8B84B]"></span>
            </span>
            Interactive Seminars
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-[#F5F0E8] mb-6 tracking-tight leading-[1.05]">
            Real-Time Interaction.<br />
            <span className="text-[#5D705C]">Real-World Results.</span>
          </h2>

          <p className="text-lg text-[#F5F0E8]/70 font-medium mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Don&apos;t just watch recorded videos. Join live seminars led by practitioners, ask your burning questions, and ship code in real-time.
          </p>

          <Link href="/seminars">
            <button className="px-10 py-4 bg-[#F5F0E8] text-[#1A3C2E] rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#E8B84B] hover:text-[#1A3C2E] transition-all shadow-xl active:scale-95 flex items-center gap-2 mx-auto lg:mx-0 group cursor-pointer">
              View Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        {/* Card Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-md relative"
        >
          {/* Decorative Ring */}
          <div className="absolute -inset-4 border border-[#F5F0E8]/5 rounded-3xl pointer-events-none" />

          <div className="relative bg-[#132A20] border border-[#F5F0E8]/10 p-10 rounded-[2rem] overflow-hidden shadow-2xl group transition-all duration-500 hover:border-[#E8B84B]/20">

            {/* Card Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[#5D705C] text-[10px] font-bold uppercase tracking-[2px]">Next Session</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[10px] font-bold text-[#E8B84B] uppercase tracking-wider">
                Certificate Included
              </div>
            </div>

            <h3 className="text-3xl font-bold text-[#F5F0E8] mb-3 leading-tight tracking-tight">
              Applied AI: Building Autonomous Agents
            </h3>
            <p className="text-[#5D705C] text-sm mb-10 font-medium">
              Master the art of building agents that think and act using LLMs, LangChain, and Vector DBs.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4 text-[#F5F0E8] bg-white/5 p-4 rounded-2xl border border-white/5">
                <Calendar className="w-5 h-5 text-[#E8B84B]" />
                <span className="text-sm font-bold tracking-tight">Saturday, 7:00 PM IST</span>
              </div>
              <div className="flex items-center gap-4 text-[#5D705C] bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#132A20] bg-[#2D6A4F] flex items-center justify-center text-[8px] font-bold text-white uppercase">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold tracking-tight text-[#F5F0E8]">140+ practitioners attending</span>
              </div>
            </div>

            <Link href="/seminars">
              <button className="w-full py-5 bg-[#2D6A4F] hover:bg-[#388561] text-[#F5F0E8] rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#2D6A4F]/20 flex items-center justify-center gap-3 group-hover:-translate-y-0.5 cursor-pointer">
                <Video className="w-5 h-5" />
                Reserve Your Seat
              </button>
            </Link>

            {/* Status Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#E8B84B]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

