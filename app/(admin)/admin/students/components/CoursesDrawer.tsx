'use client';

import { motion } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Course } from '../types';

interface CoursesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courses: Course[];
}

export const CoursesDrawer = ({
  isOpen,
  onClose,
  studentName,
  courses
}: CoursesDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F4]">
          <div>
            <h2 className="text-[20px] font-bold text-[#1C2B4A]">Enrolled Courses</h2>
            <p className="text-sm text-[#7A8FAF]">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F8F9FC] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#7A8FAF]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#1C2B4A] mb-2">No courses enrolled</h3>
              <p className="text-sm text-[#7A8FAF]">
                This student hasn&apos;t been enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border border-[#E2E8F4] rounded-xl hover:border-[#E8B84B] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {course.courseThumbnail ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image
                          src={course.courseThumbnail}
                          alt={course.courseName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[#F8F9FC] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#7A8FAF]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1C2B4A] text-sm truncate">
                        {course.courseName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          course.status === 'active' ? "bg-green-50 text-green-600" :
                            course.status === 'completed' ? "bg-blue-50 text-blue-600" :
                              "bg-gray-50 text-gray-600"
                        )}>
                          {course.status}
                        </span>
                        <span className="text-[10px] text-[#7A8FAF]">
                          {course.progressPercentage}% complete
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-[#E2E8F4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8B84B] rounded-full transition-all"
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

