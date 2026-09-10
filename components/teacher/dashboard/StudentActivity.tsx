'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  UserPlus, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { TeacherActivityItem } from '@/lib/types/teacher-dashboard';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface StudentActivityProps {
  activities: TeacherActivityItem[];
}

export default function StudentActivity({ activities }: StudentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ENROLLMENT': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'PROGRESS': return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'QUESTION': return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'ASSIGNMENT_SUBMISSION': return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      default: return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'ENROLLMENT': return "bg-blue-50 text-blue-700";
      case 'PROGRESS': return "bg-emerald-50 text-emerald-700";
      case 'QUESTION': return "bg-amber-50 text-amber-700";
      case 'ASSIGNMENT_SUBMISSION': return "bg-purple-50 text-purple-700";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time updates from your students</p>
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {activities.length > 0 ? (
          activities.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-6 group"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                  {item.studentImage ? (
                    <Image src={item.studentImage} alt={item.studentName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-slate-400">
                      {item.studentName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-sm",
                  getBadgeColor(item.type)
                )}>
                  {getIcon(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black text-slate-900 truncate">{item.studentName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium truncate">
                  {item.type === 'ENROLLMENT' ? 'Enrolled in ' : 'Started lesson in '}
                  <span className="text-slate-900 font-bold italic">{item.courseName}</span>
                </p>
                {item.progress !== undefined && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: `${item.progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{item.progress}%</span>
                  </div>
                )}
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 italic">No activity yet</p>
          </div>
        )}
      </div>

      <button className="w-full py-4 bg-slate-50/50 hover:bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors border-t border-slate-50">
        View All Activity
      </button>
    </div>
  );
}

