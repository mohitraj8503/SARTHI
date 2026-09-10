'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ClientProps {
  batch: any;
  isLoggedIn: boolean;
}

export default function InternshipDetailClient({ batch, isLoggedIn }: ClientProps) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/internship/${batch.id}`);
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch('/api/internship/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batch.id }),
      });
      if (res.ok) {
        router.push('/dashboard/internship');
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#F8F5F0] text-gray-800 p-6 md:p-12 lg:p-24 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/internship" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1B4332] hover:text-[#2D6A4F] transition-all group"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          Back to Internship Catalog
        </Link>

        {/* Detailed Container Card */}
        <div className="bg-white rounded-[3rem] border border-gray-150 p-8 md:p-12 lg:p-16 shadow-[0_30px_70px_-15px_rgba(27,67,50,0.06)] space-y-8">
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#40916C] bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Cohort Batch
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {batch.duration}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              OPEN
            </span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#1B4332] leading-none">
              {batch.internship.title}
            </h1>
            <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest">
              Cohort: {batch.name}
            </h2>
          </div>

          {/* Mentor Profile */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black uppercase text-sm">
              {batch.mentorName.charAt(0)}
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Instructor / Mentor</span>
              <h4 className="text-sm font-bold text-[#1B4332] uppercase">{batch.mentorName}</h4>
              <p className="text-[10px] text-gray-400">{batch.mentorTitle}</p>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none text-gray-600 font-medium text-sm leading-relaxed space-y-4">
            <p>{batch.internship.description}</p>
            <p>
              In this internship cohort, you will learn to build real-world client deliverables under active mentor guidance, participate in dynamic code review checks, earn XP rewards, check-in daily, and work on simulated production challenges.
            </p>
          </div>

          {/* Milestones / Phases */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Curriculum Milestones</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { step: "Phase 1", title: "Orientation & Tool Setups" },
                { step: "Phase 2", title: "Core Skill Practice & Daily Tasks" },
                { step: "Phase 3", title: "Weekly Projects & Code Review" },
                { step: "Phase 4", title: "Final evaluation & LOR generation" },
              ].map((phase, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#40916C] uppercase tracking-wider block">{phase.step}</span>
                  <h4 className="text-xs font-bold text-gray-800 uppercase">{phase.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Join Button */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tuition Pricing</span>
              <span className="text-xl font-black text-[#1B4332] uppercase">FREE / SPONSORED</span>
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full sm:w-auto px-10 py-5 bg-[#1B4332] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-xl shadow-[#1B4332]/20 flex items-center justify-center gap-2"
            >
              {enrolling ? 'Enrolling...' : 'Join Cohort Program'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
