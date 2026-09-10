'use client';

export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CreateCourseWizard = nextDynamic(
  () => import('@/components/teacher/courses/CreateCourseWizard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Creator Wizard...</p>
      </div>
    )
  }
);

export default function NewCoursePage() {
  return <CreateCourseWizard />;
}

