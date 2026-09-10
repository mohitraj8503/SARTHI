import Link from 'next/link';
import { Check, GraduationCap, Briefcase } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-emerald-50 to-white py-16 md:py-24 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-100/50 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-50 blur-[80px] rounded-full -ml-10 -mb-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Clear value prop */}
          <div className="space-y-8">
            {/* Trust badge first */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
              Verified Impact Program • 127 Villages • 3,842 Students
            </div>
            
            {/* Specific headline - no buzzwords */}
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              FREE DIGITAL SKILLS <br />
              <span className="text-emerald-600">FOR RURAL INDIA</span>
            </h1>
            
            {/* Concrete subhead - what, who, where */}
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              Empowering government schools with laptops, projectors, and certified instructors. 
              Bridging the digital divide one village at a time through hands-on coding and career training.
            </p>
            
            {/* Specific outcomes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OutcomeCard 
                value="87%" 
                label="Certification Rate"
                sublabel="Of enrolled students"
                icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
              />
              <OutcomeCard 
                value="62%" 
                label="Digital Employment"
                sublabel="Within 6 months of completion"
                icon={<Briefcase className="w-5 h-5 text-emerald-600" />}
              />
            </div>
            
            {/* Clear CTAs by user type */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/rural-initiative/apply-student"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 min-h-[48px]"
              >
                Apply as Student →
              </Link>
              <Link 
                href="/rural-initiative/partner"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-black uppercase tracking-widest text-xs rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 min-h-[48px]"
              >
                Partner With Us →
              </Link>
            </div>
          </div>
          
          {/* Right: Authentic photo - not stock */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-600 rounded-[3rem] rotate-3 opacity-10 blur-sm" />
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              <Image 
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&fit=crop" 
                alt="Students learning coding at a rural camp"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            {/* Photo caption builds trust */}
            <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Real Classroom: Madhubani, Bihar • February 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomeCard({ value, label, sublabel, icon }: { value: string; label: string; sublabel: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-emerald-50 rounded-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1.5">{label}</p>
        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}
