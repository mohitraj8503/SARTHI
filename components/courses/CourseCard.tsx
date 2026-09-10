'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';

interface CoursePreview {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  pricing_type: string;
  rating: number;
  enrolledStudentsCount: number;
  instructor: {
    name: string;
    avatar?: string;
  };
  level: string;
  duration?: number;
}

/**
 * High-Conversion Course Discovery Card
 * Features premium hover effects, mobile-optimized tap targets, and clear pricing signals.
 */
export function CourseCard({ course }: { course: CoursePreview }) {
  const isFree = course.pricing_type === 'FREE' || Number(course.price) === 0;

  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:border-emerald-100 active:scale-[0.99]">
      {/* Visual Anchor: Thumbnail with Badges */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <span className="text-emerald-200 text-6xl font-black opacity-20 italic">TT</span>
          </div>
        )}
        
        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFree && (
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-900/20">
              Scholarship / Free
            </span>
          )}
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            {course.level}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-800 transition-colors">
            {course.title}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-emerald-50 text-[#2D6A4F] px-2.5 py-1 rounded-full uppercase tracking-wider">
              SARTHI Originals
            </span>
          </div>
        </div>
        
        {/* Meta Metrics */}
        <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span>{course.rating > 0 ? course.rating.toFixed(1) : 'New'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.enrolledStudentsCount.toLocaleString()}</span>
          </div>
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{Math.round(course.duration / 60)}h</span>
            </div>
          )}
        </div>
        
        {/* Commercial Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div>
            {isFree ? (
              <span className="text-xl font-black text-emerald-600 tracking-tight">Free</span>
            ) : (
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight">₹{course.price}</span>
                <span className="text-[10px] font-bold text-slate-400 line-through">₹{Math.round(Number(course.price) * 1.5)}</span>
              </div>
            )}
          </div>
          
          <Link
            href={`/courses/${course.id}`}
            className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] 
                       flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-900/10
                       hover:bg-emerald-900 hover:shadow-emerald-900/20"
          >
            Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
