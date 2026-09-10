'use client';

import React from 'react';
import { 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    MoreHorizontal,
    Trophy,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AssignmentsTableProps {
    assignments?: any[];
    isLoading?: boolean;
}

export default function AssignmentsTable({ assignments, isLoading }: AssignmentsTableProps) {
    const displayAssignments = (assignments || []).slice(0, 5);

    return (
        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_12px_35px_rgba(15,23,42,0.06)] border border-[#EAF0F7] flex flex-col relative overflow-hidden w-full">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Active <span className="text-emerald-500">Workflows</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assignment tracking & submissions</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard/assignments" 
                        className="px-7 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-emerald-900/10 transition-all flex items-center gap-2 active:scale-95"
                    >
                        View All
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-100 rounded-2xl border border-transparent animate-pulse" />
                    ))
                ) : displayAssignments.length > 0 ? (
                    displayAssignments.map((assignment, index) => (
                        <AssignmentRow key={assignment.id || index} assignment={assignment} />
                    ))
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                            <FileText className="w-7 h-7 text-slate-300" />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">No Active Assignments</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">You have cleared all pending deadlines for now.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AssignmentRow({ assignment }: { assignment: any }) {
    const isOverdue = assignment.dueDate && isPast(new Date(assignment.dueDate)) && assignment.status !== 'GRADED' && assignment.status !== 'SUBMITTED';
    const isGraded = assignment.status === 'GRADED';
    const isSubmitted = assignment.status === 'SUBMITTED';
    
    const dueDateText = assignment.dueDate 
        ? formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true }) 
        : 'No date';

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-200 hover:shadow-md">
            <div className="flex items-center gap-4 flex-1 w-full">
                {/* Icon Wrapper */}
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border shrink-0",
                    isGraded ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                    isOverdue ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                    {isGraded ? <Trophy className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                {/* Assignment Details */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm tracking-tight leading-none truncate">{assignment.title}</h4>
                        {isOverdue && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                Overdue
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {assignment.course?.title || 'General Module'}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {dueDateText}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metric */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                {isGraded ? (
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <span className="text-base font-black text-emerald-600 leading-none">{assignment.score}</span>
                            <span className="text-xs font-black text-slate-300 uppercase">/ {assignment.maxScore}</span>
                        </div>
                        <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Graded Score</p>
                    </div>
                ) : (
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.status || 'Active'}</p>
                    </div>
                )}

                {/* Submission Action */}
                <Link
                    href={assignment.isInternship ? `/dashboard/internship/assignments/${assignment.id}` : `/dashboard/assignments/${assignment.id}`}
                    className={cn(
                        "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 text-center",
                        isGraded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" :
                        isSubmitted ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200" :
                        "bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-lg shadow-emerald-900/10"
                    )}
                >
                    {isGraded ? (
                        <>
                            <CheckCircle2 size={12} />
                            Done
                        </>
                    ) : isSubmitted ? (
                        <>
                            <Clock size={12} />
                            Pending
                        </>
                    ) : (
                        <>
                            <ArrowRight size={12} />
                            Submit
                        </>
                    )}
                </Link>
            </div>
        </div>
    );
}
