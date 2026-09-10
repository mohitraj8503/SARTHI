'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AtRiskStudentsWidget() {
  const { data: students, isLoading } = useQuery({
    queryKey: ['at-risk-students'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/students/at-risk');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.success ? json.data : [];
    }

  });

  if (isLoading) return <div className="h-48 bg-slate-50 animate-pulse rounded-3xl" />;

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#F1F5F9] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-rose-600 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Priority Focus
        </h3>
        <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-1 rounded-full font-black">
          {students?.length || 0} Alert
        </span>
      </div>

      <div className="space-y-3">
        {students?.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">All students on track!</p>
        ) : (
          students?.map((student: any) => (
            <div key={student.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm relative">
                  <Image 
                    src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}`} 
                    alt={student.name || "Student profile"} 
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized={student.avatar?.startsWith('http') || !student.avatar}
                  />
               </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">{student.name}</p>
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{student.reason} • {student.course}</p>
              </div>

              <button className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Mail className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <Link href="/teacher/students" className="mt-4 w-full py-3 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
        View Success Board
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

