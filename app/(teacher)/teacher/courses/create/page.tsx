'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TeacherCreateCoursePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teacher/courses/new');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Redirecting to Course Creator...</p>
    </div>
  );
}
