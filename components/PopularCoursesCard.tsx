'use client';

import { motion } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  icon?: string;
}

interface PopularCoursesCardProps {
  courses?: Course[];
  title?: string;
  viewAllLink?: string;
}

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'Python for Beginners',
    instructor: 'Expert Mentor',
    description: 'Start your coding journey',
    icon: '🐍',
  },
  {
    id: '2',
    title: 'CSS Masterclass',
    instructor: 'Industry Expert',
    description: 'Master modern CSS',
    icon: '🎨',
  },
  {
    id: '3',
    title: 'JavaScript Fundamentals',
    instructor: 'Industry Expert',
    description: 'Build interactive web apps',
    icon: '⚡',
  },
];

export default function PopularCoursesCard({ 
  courses = defaultCourses,
  title = 'Popular Courses',
  viewAllLink = '/courses'
}: PopularCoursesCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <a 
          href={viewAllLink}
          className="text-sm font-medium text-[#FF6A00] hover:text-[#E05E00] transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Course List */}
      <div className="space-y-2">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg shrink-0">
              {course.icon || <BookOpen className="w-5 h-5 text-[#FF6A00]" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-gray-900 truncate group-hover:text-[#FF6A00] transition-colors">
                {course.title}
              </p>
              <p className="text-[13px] text-gray-500 truncate">
                {course.description}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF6A00] group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

