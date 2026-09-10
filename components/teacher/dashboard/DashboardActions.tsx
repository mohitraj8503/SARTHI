'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CourseBuilderModal from './CourseBuilderModal';

export default function DashboardActions() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsBuilderOpen(true)}
        className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20 border border-slate-700"
      >
        <Plus className="w-4 h-4" />
        New Course
      </button>
      <CourseBuilderModal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
    </>
  );
}
