'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Star, 
  BookOpen, 
  IndianRupee, 
  Activity,
  Shield,
  AlertCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export function TeacherIntelligencePanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-teacher-intelligence'],
    queryFn: async () => {
      const res = await fetch('/api/admin/health');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const teachers = data?.topTeachers || [];

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-2xl overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tighter uppercase">Teacher Intelligence</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Faculty by Impact</p>
          </div>
        </div>
        <Link href="/admin/teachers" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F172A] transition-colors flex items-center gap-1">
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="px-8 py-5 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-2 bg-slate-50 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center opacity-40">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Faculty Data</p>
          </div>
        ) : (
          teachers.map((teacher: any, i: number) => (
            <TeacherRow key={teacher.id} teacher={teacher} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}

function TeacherRow({ teacher, rank }: { teacher: any; rank: number }) {
  const initials = teacher.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const students = teacher.teacher?.totalStudents || 0;
  const rating = teacher.teacher?.averageRating || 0;
  const courses = teacher._count?.courses || 0;
  const earnings = teacher.teacher?.totalEarnings || 0;

  const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700', 'text-slate-300', 'text-slate-300'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="px-8 py-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group"
    >
      {/* Rank */}
      <span className={cn("text-xs font-black w-4 text-center", rankColors[rank - 1] || 'text-slate-300')}>
        {rank}
      </span>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 overflow-hidden relative shrink-0">
        {teacher.image ? (
          <Image src={teacher.image} alt={teacher.name || ''} fill className="object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-black text-[#0F172A] truncate group-hover:text-indigo-600 transition-colors">
            {teacher.name || 'Faculty Member'}
          </h4>
          {rating >= 4.5 && <Zap className="w-3 h-3 text-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" /> {students}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-amber-400" /> {rating.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
            <BookOpen className="w-2.5 h-2.5" /> {courses}
          </span>
        </div>
      </div>

      {/* Earnings */}
      <div className="text-right shrink-0">
        <p className="text-[12px] font-black text-emerald-600">₹{(earnings / 1000).toFixed(1)}k</p>
        <p className="text-[9px] font-black text-slate-300 uppercase">Revenue</p>
      </div>

      {/* Quick Action */}
      <Link 
        href={`/admin/teachers/${teacher.id}`}
        className="w-8 h-8 rounded-xl border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-indigo-200 hover:text-indigo-600"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
