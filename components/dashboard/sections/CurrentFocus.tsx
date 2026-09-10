'use client';

import { ArrowRight, BookOpen, Target, Sparkles, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CourseProgress, JourneyState } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface CurrentFocusProps {
  enrolledCoursesCount: number;
  journeyState: JourneyState;
  continueLearning?: CourseProgress[];
}

export default function CurrentFocus({ enrolledCoursesCount, journeyState, continueLearning = [] }: CurrentFocusProps) {
  const getFocusContent = () => {
    switch (journeyState) {
      case 'new':
        return (
          <div className="bg-white border border-[#EAE6DF] border-dashed rounded-[32px] p-12 text-center group cursor-pointer hover:border-[#D4956A]/50 transition-all">
            <div className="w-20 h-20 bg-[#F7F4EF] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#EAE6DF] group-hover:scale-110 transition-transform">
              <Rocket className="w-10 h-10 text-[#D4956A]" />
            </div>
            <h3 className="text-[22px] font-bold text-[#1F2937] mb-2">Ready to crack AI?</h3>
            <p className="text-[#7A8FAF] text-[14px] mb-8 max-w-xs mx-auto font-medium">Your journey is a blank canvas. Pick your first masterclass and start building your future.</p>
            <Link href="/courses" className="inline-flex h-12 px-8 items-center justify-center rounded-2xl bg-[#1F2937] text-white font-bold text-[14px] uppercase tracking-widest shadow-lg hover:bg-[#D4956A] transition-all active:scale-95">
              Start Learning <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        );

      case 'active':
      case 'near-completion':
        if (continueLearning.length > 0) {
          const main = continueLearning[0];
          return (
            <div className="bg-white border border-[#EAE6DF] rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4956A]/5 blur-3xl rounded-full" />
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* Thumbnail */}
                <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 relative bg-[#F7F4EF] border border-[#EAE6DF]">
                  {main.thumbnail ? (
                    <Image src={main.thumbnail} alt={main.title} width={300} height={200} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#D4956A]/30">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1F2937]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                    {journeyState === 'near-completion' ? 'Final Stretch' : 'In Progress'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-4">
                    <h3 className="text-[24px] font-bold text-[#1F2937] leading-tight mb-2 group-hover:text-[#D4956A] transition-colors">
                      {main.title}
                    </h3>
                    {main.nextLesson && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#D4956A]/5 rounded-full w-fit border border-[#D4956A]/10">
                        <Sparkles className="w-3 h-3 text-[#D4956A]" />
                        <p className="text-[11px] text-[#7A8FAF] font-bold uppercase tracking-wider">
                          Next: <span className="text-[#1F2937]">{main.nextLesson.title}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A8FAF]">
                        <span>Path Mastery</span>
                        <span className="text-[#D4956A]">{main.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#F7F4EF] rounded-full overflow-hidden border border-[#EAE6DF]/10">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4956A] to-[#E5A97E] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${main.progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/courses/${main.id}/learn`}
                      className="inline-flex items-center justify-center h-12 px-8 bg-[#1F2937] text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-[#D4956A] transition-all shadow-lg active:scale-95"
                    >
                      Resume Learning <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-[#1F2937] rounded-[32px] p-10 text-white flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Pick your next focus</h3>
              <p className="text-white/60 text-sm">You have {enrolledCoursesCount} active courses. Which one are we crushing today?</p>
            </div>
            <Link href="/dashboard/courses" className="px-6 py-3 bg-white text-[#1F2937] rounded-xl font-bold text-sm hover:bg-[#D4956A] hover:text-white transition-all">
              Go to Courses
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#D4956A] rounded-full" />
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight uppercase tracking-widest text-[14px]">Your Active Path</h2>
        </div>
        <Link href="/dashboard/courses" className="text-[12px] font-bold text-[#D4956A] hover:underline transition-all uppercase tracking-widest">See all paths</Link>
      </div>
      {getFocusContent()}
    </section>
  );
}

