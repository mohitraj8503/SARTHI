'use client'

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Enterprise Course Progress Tile
 * Designed for scannability and quick interaction.
 */
export function CourseProgressCard({ course }: { course: any }) {
  const { progress } = course;
  
  return (
    <div className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-100 active:scale-[0.99]">
      <div className="flex gap-5">
        {/* Thumbnail with Overlay */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner bg-slate-100">
          {course.thumbnail ? (
            <Image 
              src={course.thumbnail} 
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              No Img
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <h4 className="font-bold text-slate-900 truncate leading-tight group-hover:text-emerald-800 transition-colors">
              {course.title}
            </h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Last Studied: {new Date(progress.lastStudied).toLocaleDateString()}
            </p>
          </div>
          
          {/* Progress Bar & CTA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600">{progress.percent}%</span>
            </div>
            
            <Link
              href={`/m/dashboard/courses/${course.id}`}
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-emerald-700 transition-colors"
            >
              Resume Learning <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
