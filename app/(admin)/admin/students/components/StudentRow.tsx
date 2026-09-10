'use client';

import React from 'react';
import { Mail, MoreVertical, Edit2, Trash2, Pause, Play, BookOpen, GraduationCap, DollarSign, Key, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Student } from '../types';

interface StudentRowProps {
  student: Student;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRowClick: (student: Student) => void;
  onCoursesClick: (student: Student, e: React.MouseEvent) => void;
  onEditClick: (student: Student, e: React.MouseEvent) => void;
  onDeleteClick: (student: Student, e: React.MouseEvent) => void;
  onSuspendClick: (student: Student, e: React.MouseEvent) => void;
  handleCopyEmail: (email: string) => void;
  onResetPassword: (student: Student) => void;
}

export const StudentRow = React.memo(({
  student,
  isSelected,
  onToggleSelect,
  onRowClick,
  onCoursesClick,
  onEditClick,
  onDeleteClick,
  onSuspendClick,
  handleCopyEmail,
  onResetPassword
}: StudentRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Premium Avatar Logic: Prioritize User Upload (avatar_url) with Cache Busting -> System/OAuth (image) -> Initials
  const profileImage = student.avatar_url 
    ? `${student.avatar_url}?v=${student.avatar_version || 0}` 
    : student.image;
    
  const initials = student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
  
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 
      'bg-rose-500', 'bg-amber-500', 'bg-violet-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <tr 
      className={cn(
        "group hover:bg-[#F8FAFC] transition-all cursor-pointer border-l-[3px] border-transparent hover:border-amber-500 animate-in fade-in duration-200",
        isSelected && "bg-[#F8FAFC] border-amber-500"
      )}
      onClick={() => onRowClick(student)}
    >
      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-slate-200 text-amber-500 focus:ring-amber-500 cursor-pointer transition-all"
        />
      </td>
      
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="relative group/avatar overflow-hidden w-12 h-12 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt={student.name || ''} 
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-white font-black text-sm transition-all duration-300 group-hover/avatar:scale-110",
                getInitialsColor(student.name || 'Student')
              )}>
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/5 transition-colors duration-300" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-[#0F172A] truncate group-hover:text-amber-600 transition-colors">
              {student.name || 'Anonymous Student'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center bg-slate-100/50 border border-slate-200/50 rounded-lg px-2 py-0.5 group/id hover:bg-slate-100 transition-all">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-[0.04em]">
                  {student.enrollmentNumber || student.studentId || "ID PENDING"}
                </span>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const copyId = student.enrollmentNumber || student.studentId || student.id;
                    navigator.clipboard.writeText(copyId);
                    handleCopyEmail(copyId); 
                  }}
                  className="ml-1.5 p-0.5 text-slate-300 hover:text-amber-500 transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Platform Segment Badge */}
              <span className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider",
                student.platformSegment === 'JUNIOR'
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : student.platformSegment === 'PENDING'
                  ? "bg-purple-50 text-purple-800 border-purple-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
              )}>
                {student.platformSegment === 'JUNIOR' 
                  ? '🎒 JUNIOR' 
                  : student.platformSegment === 'PENDING'
                  ? '⏳ PENDING'
                  : '🎓 MAIN'}
              </span>
              {student.educationLevel ? (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded hidden sm:inline-block">
                  {student.educationLevel.replace('_', ' ')}
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded hidden sm:inline-block">
                  Profile Incomplete
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-slate-600 font-medium">{student.email}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopyEmail(student.email); }}
            className="p-1.5 text-slate-300 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-[13px] text-slate-500 font-medium">
            {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'N/A'}
          </span>
          <span className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">Registration Date</span>
        </div>
      </td>

      <td className="px-8 py-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border",
          student.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
          student.status === 'SUSPENDED' ? "bg-rose-50 text-rose-600 border-rose-100/50" :
          "bg-slate-50 text-slate-600 border-slate-100/50"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-glow", 
            student.status === 'ACTIVE' ? "bg-emerald-500" : 
            student.status === 'SUSPENDED' ? "bg-rose-500" : "bg-slate-400"
          )} />
          {student.status}
        </div>
      </td>

      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={(e) => onCoursesClick(student, e)}
            className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all group/btn"
            title="View Courses"
          >
            <BookOpen className="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={(e) => { onEditClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Edit2 className="w-4 h-4 text-amber-500" /> Edit Profile
                  </button>
                  <button onClick={(e) => { onSuspendClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                    {student.status === 'SUSPENDED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {student.status === 'SUSPENDED' ? 'Restore Access' : 'Suspend Access'}
                  </button>
                  <button onClick={(e) => { onResetPassword(student); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Key className="w-4 h-4 text-blue-500" /> Reset Password
                  </button>
                  <div className="h-px bg-slate-100 my-2" />
                  <button onClick={(e) => { onDeleteClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-slate-400 hover:bg-rose-600 hover:text-white flex items-center gap-3 transition-all group/delete">
                    <Trash2 className="w-4 h-4 group-hover/delete:text-white" /> Deactivate Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
});

export const StudentCard = React.memo(({
  student,
  isSelected,
  onToggleSelect,
  onRowClick,
  onCoursesClick,
  onEditClick,
  onDeleteClick,
  onSuspendClick,
  handleCopyEmail,
  onResetPassword
}: StudentRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const profileImage = student.avatar_url 
    ? `${student.avatar_url}?v=${student.avatar_version || 0}` 
    : student.image;
    
  const initials = student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
  
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 
      'bg-rose-500', 'bg-amber-500', 'bg-violet-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div 
      onClick={() => onRowClick(student)}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 p-4 space-y-3 cursor-pointer hover:border-amber-400 transition-all shadow-sm relative animate-in fade-in duration-200",
        isSelected && "border-amber-500 bg-amber-50/10"
      )}
    >
      {/* Top Bar: Checkbox + Avatar + Name & ID + Actions Menu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className="w-4 h-4 rounded border-slate-200 text-amber-500 focus:ring-amber-500 cursor-pointer flex-shrink-0"
          />
          <div className="relative overflow-hidden w-10 h-10 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt={student.name || ''} 
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-white font-black text-xs",
                getInitialsColor(student.name || 'Student')
              )}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#0F172A] truncate">
              {student.name || 'Anonymous Student'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {student.enrollmentNumber || student.studentId || "ID PENDING"}
              </span>
              <span className={cn(
                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                student.platformSegment === 'JUNIOR'
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
              )}>
                {student.platformSegment === 'JUNIOR' ? '🎒 JUNIOR' : '🎓 MAIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button onClick={(e) => { onEditClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 flex items-center gap-3">
                  <Edit2 className="w-4 h-4 text-amber-500" /> Edit Profile
                </button>
                <button onClick={(e) => { onCoursesClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> View Courses
                </button>
                <button onClick={(e) => { onSuspendClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3">
                  {student.status === 'SUSPENDED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {student.status === 'SUSPENDED' ? 'Restore Access' : 'Suspend Access'}
                </button>
                <button onClick={(e) => { onResetPassword(student); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 flex items-center gap-3">
                  <Key className="w-4 h-4 text-blue-500" /> Reset Password
                </button>
                <div className="h-px bg-slate-100 my-2" />
                <button onClick={(e) => { onDeleteClick(student, e); setIsMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-sm font-bold text-slate-400 hover:bg-rose-600 hover:text-white flex items-center gap-3 group/delete">
                  <Trash2 className="w-4 h-4 group-hover/delete:text-white" /> Deactivate Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle Bar: Email & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-600 font-medium truncate">{student.email}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopyEmail(student.email); }}
            className="p-1 text-slate-300 hover:text-amber-500 flex-shrink-0"
            title="Copy Email"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Joined: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </div>
      </div>

      {/* Bottom Bar: Status Badge */}
      <div className="flex items-center justify-between pt-1">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
          student.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
          student.status === 'SUSPENDED' ? "bg-rose-50 text-rose-600 border-rose-100/50" :
          "bg-slate-50 text-slate-600 border-slate-100/50"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
            student.status === 'ACTIVE' ? "bg-emerald-500" : 
            student.status === 'SUSPENDED' ? "bg-rose-500" : "bg-slate-400"
          )} />
          {student.status}
        </div>
      </div>
    </div>
  );
});

StudentRow.displayName = 'StudentRow';
StudentCard.displayName = 'StudentCard';

