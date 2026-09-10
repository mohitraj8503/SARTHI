'use client';

import React from 'react';
import { 
  Copy, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronRight, 
  LogIn, 
  Lock, 
  CheckCircle2,
  BookOpen,
  Users as UsersIcon,
  Mail,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherRowProps {
  teacher: any;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onAction: (id: string, action: string) => void;
}

const getInitialColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 
    'bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const TeacherRow = ({ teacher, isSelected, onSelect, onAction }: TeacherRowProps) => {
  const initials = teacher.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const initialBg = getInitialColor(teacher.name || teacher.email);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // You could trigger a toast here if needed
  };

  return (
    <tr 
      onClick={() => onAction(teacher.id, 'view')}
      className={cn(
        "group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer border-b border-slate-100/50 relative hover:z-10",
        isSelected && "bg-blue-50/50 hover:bg-blue-50"
      )}
    >
      <td className="pl-6 py-4 w-12" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(teacher.id, e as any)}
            className="w-5 h-5 rounded-lg border-slate-200 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer transition-all"
          />
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative group/avatar">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm transition-transform duration-500 group-hover/avatar:scale-110 group-hover/avatar:rotate-3 overflow-hidden relative",
              teacher.image ? "bg-slate-100" : initialBg
            )}>
              {teacher.image ? (
                <img src={teacher.image} alt={teacher.name || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-black text-[#0F172A] tracking-tight group-hover:text-amber-600 transition-colors">
                {teacher.name || 'Faculty Member'}
              </span>
              {teacher.teacher?.title?.includes('Dr.') && (
                <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-amber-200/50">
                  Ph.D Verified
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">
              {teacher.teacher?.title || 'Instructor'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono tracking-[0.04em] bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                {teacher.enrollmentNumber || teacher.teacherId || 'NO-ID'}
              </span>
              <button 
                onClick={(e) => copyToClipboard(teacher.teacherId || '', e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-md transition-all text-slate-300 hover:text-slate-600 shadow-sm"
                title="Copy Professional ID"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-300" />
            {teacher.email}
          </div>
          {teacher.requiresPasswordChange ? (
            <div className="flex items-center gap-1 mt-1">
              <Lock className="w-2.5 h-2.5 text-amber-500" />
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Password Reset Required</p>
            </div>
          ) : (
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Institutional Access Secure</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            {new Date(teacher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Registration Date</p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 text-blue-600">
                 <BookOpen className="w-3.5 h-3.5" />
                 <span className="text-[14px] font-black">{teacher._count?.courses || 0}</span>
               </div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Courses</span>
            </div>
            <div className="flex flex-col border-l border-slate-100 pl-4">
               <div className="flex items-center gap-1.5 text-emerald-600">
                 <UsersIcon className="w-3.5 h-3.5" />
                 <span className="text-[14px] font-black">{teacher._count?.students || 0}</span>
               </div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Students</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
            teacher.status === 'verified' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
            teacher.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100/50" : 
            "bg-rose-50 text-rose-600 border-rose-100/50"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              teacher.status === 'verified' ? "bg-emerald-500 animate-pulse" :
              teacher.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
            )} />
            {teacher.status || 'INACTIVE'}
          </div>
          {teacher.onboardingStatus === 'PENDING' && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-tighter self-start border border-blue-100">
              Onboarding Link Sent
            </div>
          )}
        </div>
      </td>

      <td className="pr-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onAction(teacher.id, 'edit')}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-[#0F172A] rounded-xl transition-all shadow-sm border border-transparent hover:border-[#0F172A]"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <div className="relative group/menu">
            <button className="p-2.5 text-slate-400 hover:text-[#0F172A] hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
              <MoreVertical className="w-5 h-5" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50">
               <button onClick={() => onAction(teacher.id, 'reset-password')} className="w-full px-4 py-3 text-left text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3 uppercase tracking-widest">
                 <Lock className="w-4 h-4 text-slate-400" /> Reset Password
               </button>
               {teacher.status !== 'verified' && (
                 <button onClick={() => onAction(teacher.id, 'verify')} className="w-full px-4 py-3 text-left text-[11px] font-black text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3 uppercase tracking-widest">
                   <CheckCircle2 className="w-4 h-4" /> Verify Account
                 </button>
               )}
               <button onClick={() => onAction(teacher.id, 'impersonate')} className="w-full px-4 py-3 text-left text-[11px] font-black text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3 uppercase tracking-widest">
                 <LogIn className="w-4 h-4" /> Impersonate
               </button>
               <div className="h-px bg-slate-100 my-1" />
               <button onClick={() => onAction(teacher.id, 'suspend')} className="w-full px-4 py-3 text-left text-[11px] font-black text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3 uppercase tracking-widest">
                 <Trash2 className="w-4 h-4" /> Suspend Instructor
               </button>
            </div>
          </div>

          <button 
            onClick={() => onAction(teacher.id, 'view')}
            className="p-2.5 text-slate-400 hover:text-[#0F172A] hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const TeacherCard = ({ teacher, isSelected, onSelect, onAction }: TeacherRowProps) => {
  const initials = teacher.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const initialBg = getInitialColor(teacher.name || teacher.email);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div 
      onClick={() => onAction(teacher.id, 'view')}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 p-4 space-y-3 cursor-pointer hover:border-amber-400 transition-all shadow-sm relative animate-in fade-in duration-200",
        isSelected && "border-amber-500 bg-amber-50/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onSelect(teacher.id, e as any); }}
            className="w-4 h-4 rounded border-slate-200 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer flex-shrink-0"
          />
          <div className="relative group/avatar overflow-hidden w-11 h-11 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
            {teacher.image ? (
              <img src={teacher.image} alt={teacher.name || ''} className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center text-white font-black text-xs", initialBg)}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#0F172A] truncate">
              {teacher.name || 'Faculty Member'}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {teacher.teacher?.title || 'Instructor'} • <span className="font-mono">{teacher.enrollmentNumber || teacher.teacherId || 'NO-ID'}</span>
            </p>
          </div>
        </div>

        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <button onClick={() => { onAction(teacher.id, 'edit'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-amber-500" /> Edit Profile
                </button>
                <button onClick={() => { onAction(teacher.id, 'reset-password'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Reset Password
                </button>
                {teacher.status !== 'verified' && (
                  <button onClick={() => { onAction(teacher.id, 'verify'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Verify Account
                  </button>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { onAction(teacher.id, 'suspend'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Suspend Instructor
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{teacher.email}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
          teacher.status === 'verified' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
          teacher.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100/50" : 
          "bg-rose-50 text-rose-600 border-rose-100/50"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            teacher.status === 'verified' ? "bg-emerald-500 animate-pulse" :
            teacher.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
          )} />
          {teacher.status || 'INACTIVE'}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onAction(teacher.id, 'view'); }}
          className="text-xs font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1"
        >
          View Profile <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

